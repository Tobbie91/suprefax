import { randomUUID } from "crypto";
import { db } from "../db/index.js";
import { initiateProve, getProveStatus } from "../services/kyc.js";

const PHONE_RE = /^0\d{10}$/;

const pickField = (obj, ...keys) => {
  for (const k of keys) {
    const v = k.split(".").reduce((o, p) => (o ? o[p] : undefined), obj);
    if (v != null && v !== "") return v;
  }
  return null;
};

const firstFrontendUrl = () => (process.env.FRONTEND_URL || "").split(",")[0].trim() || "";

export const initiateKyc = async (req, res) => {
  const userId = req.user.id;
  const { phone } = req.body || {};

  if (!PHONE_RE.test(phone || "")) {
    return res.status(400).json({ message: "Please enter a valid Nigerian phone number (11 digits starting with 0)." });
  }

  const result = await db.query("SELECT email, full_name, role FROM users WHERE id=$1", [userId]);
  const user = result.rows[0];
  if (!user) return res.status(404).json({ message: "User not found" });

  const base = firstFrontendUrl();
  const returnPath = user.role === "agent" ? "/agent/kyc" : "/borrower/kyc";
  const redirectUrl = `${base}${returnPath}?status=mono-return`;
  const reference = randomUUID();

  const mono = await initiateProve({
    customer: {
      name: user.full_name || user.email,
      email: user.email,
      phone,
    },
    redirectUrl,
    reference,
    kycLevel: "tier_1",
    bankAccounts: false,
    meta: { user_id: userId },
  });

  if (!mono.ok) {
    return res.status(400).json({ message: "Could not start Mono verification", details: mono.data });
  }

  const providerRef = pickField(mono.data, "data.reference", "reference", "data.id", "id") || reference;
  const monoUrl = pickField(mono.data, "data.mono_url", "mono_url", "data.redirect_url", "redirect_url");

  if (!monoUrl) {
    return res.status(502).json({ message: "Unexpected Mono response shape", details: mono.data });
  }

  await db.query(
    "UPDATE users SET phone=$1, kyc_provider_ref=$2, kyc_status='pending', kyc_rejection_reason=NULL WHERE id=$3",
    [phone, providerRef, userId]
  );

  res.json({ mono_url: monoUrl, reference: providerRef });
};

export const getKycStatus = async (req, res) => {
  const result = await db.query(
    "SELECT kyc_status, kyc_rejection_reason, kyc_verified_at FROM users WHERE id=$1",
    [req.user.id]
  );
  res.json(result.rows[0] || { kyc_status: null });
};

export const finalizeKyc = async (req, res) => {
  const userId = req.user.id;
  const userRow = await db.query(
    "SELECT kyc_provider_ref, kyc_status FROM users WHERE id=$1",
    [userId]
  );
  const user = userRow.rows[0];
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.kyc_status === "verified") return res.json({ kyc_status: "verified" });
  if (!user.kyc_provider_ref) return res.json({ kyc_status: user.kyc_status || "pending" });

  const mono = await getProveStatus(user.kyc_provider_ref);
  if (!mono.ok) {
    return res.json({ kyc_status: user.kyc_status || "pending", provider_error: mono.data?.message || "Mono status check failed" });
  }

  const body = mono.data?.data || mono.data || {};
  const providerStatus = String(body.status || body.session_status || "").toLowerCase();
  const isSuccess = /success|verified|complete|approved/.test(providerStatus);
  const isFailure = /fail|reject|cancel|declined/.test(providerStatus);

  if (isSuccess) {
    const identity = body.identity || body.customer || body;
    const nin = pickField(identity, "nin", "nin_data.nin");
    const bvn = pickField(identity, "bvn", "bvn_data.bvn");
    const address = pickField(identity, "address", "residential_address", "house_address");
    await db.query(
      `UPDATE users
         SET kyc_status='verified',
             kyc_nin=COALESCE($1, kyc_nin),
             kyc_bvn=COALESCE($2, kyc_bvn),
             kyc_address=COALESCE($3, kyc_address),
             kyc_verified_at=NOW(),
             kyc_rejection_reason=NULL
       WHERE id=$4`,
      [nin, bvn, address, userId]
    );
    return res.json({ kyc_status: "verified" });
  }

  if (isFailure) {
    const reason = pickField(body, "message", "reason") || providerStatus || "Verification failed";
    await db.query(
      "UPDATE users SET kyc_status='rejected', kyc_rejection_reason=$1 WHERE id=$2",
      [reason, userId]
    );
    return res.json({ kyc_status: "rejected", kyc_rejection_reason: reason });
  }

  return res.json({ kyc_status: user.kyc_status || "pending", provider_status: providerStatus });
};

export const handleProveWebhook = async (req, res) => {
  res.status(200).json({ received: true });

  try {
    const payload = req.body || {};
    const event = pickField(payload, "event", "type") || "";
    const data = payload.data || payload;
    const reference = pickField(data, "reference", "id") || pickField(payload, "reference");
    if (!reference) {
      console.warn("[prove webhook] missing reference", JSON.stringify(payload).slice(0, 500));
      return;
    }

    const row = await db.query("SELECT id FROM users WHERE kyc_provider_ref=$1", [reference]);
    const userId = row.rows[0]?.id;
    if (!userId) {
      console.warn("[prove webhook] no user matched reference", reference);
      return;
    }

    const isSuccess =
      /success|verified|complete|approved/i.test(String(event)) ||
      data.status === "successful" ||
      data.status === "verified" ||
      data.status === "completed";

    if (isSuccess) {
      const identity = data.identity || data.customer || data;
      const nin = pickField(identity, "nin", "nin_data.nin");
      const bvn = pickField(identity, "bvn", "bvn_data.bvn");
      const address = pickField(identity, "address", "residential_address", "house_address");
      await db.query(
        `UPDATE users
           SET kyc_status='verified',
               kyc_nin=COALESCE($1, kyc_nin),
               kyc_bvn=COALESCE($2, kyc_bvn),
               kyc_address=COALESCE($3, kyc_address),
               kyc_verified_at=NOW(),
               kyc_rejection_reason=NULL
         WHERE id=$4`,
        [nin, bvn, address, userId]
      );
    } else {
      const reason = pickField(data, "message", "reason") || event || "Verification failed";
      await db.query(
        "UPDATE users SET kyc_status='rejected', kyc_rejection_reason=$1 WHERE id=$2",
        [reason, userId]
      );
    }
  } catch (err) {
    console.error("[prove webhook] handler error", err);
  }
};
