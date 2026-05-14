import { db } from "../db/index.js";
import { verifyNIN, verifyBVN, verifyLiveness, faceMatch } from "../services/kyc.js";

const NIN_RE = /^\d{11}$/;
const BVN_RE = /^\d{11}$/;

const stripDataUri = (s) => (typeof s === "string" ? s.replace(/^data:image\/\w+;base64,/, "") : s);

export const submitKyc = async (req, res) => {
  const userId = req.user?.id;
  const { nin, bvn, address, selfie } = req.body || {};

  if (!NIN_RE.test(nin || "")) {
    return res.status(400).json({ message: "NIN must be 11 digits." });
  }
  if (!BVN_RE.test(bvn || "")) {
    return res.status(400).json({ message: "BVN must be 11 digits." });
  }
  if (!address || address.trim().length < 5) {
    return res.status(400).json({ message: "Address is required." });
  }
  if (!selfie || typeof selfie !== "string" || selfie.length < 100) {
    return res.status(400).json({ message: "A live selfie is required." });
  }

  const selfieB64 = stripDataUri(selfie);

  const ninCheck = await verifyNIN(nin);
  if (!ninCheck.ok) {
    await markRejected(userId, `NIN check failed: ${ninCheck.data?.message || "unknown"}`);
    return res.status(400).json({ message: "NIN verification failed.", details: ninCheck.data });
  }

  const bvnCheck = await verifyBVN(bvn);
  if (!bvnCheck.ok) {
    await markRejected(userId, `BVN check failed: ${bvnCheck.data?.message || "unknown"}`);
    return res.status(400).json({ message: "BVN verification failed.", details: bvnCheck.data });
  }

  const liveness = await verifyLiveness(selfieB64);
  if (!liveness.ok) {
    await markRejected(userId, `Liveness check failed: ${liveness.data?.message || "unknown"}`);
    return res.status(400).json({ message: "Selfie liveness check failed.", details: liveness.data });
  }

  const referenceImage = ninCheck.data?.data?.image || ninCheck.data?.image;
  if (referenceImage) {
    const match = await faceMatch(selfieB64, referenceImage);
    if (!match.ok) {
      await markRejected(userId, `Face match failed: ${match.data?.message || "unknown"}`);
      return res.status(400).json({ message: "Selfie does not match NIN photo.", details: match.data });
    }
  }

  const providerRef = [ninCheck.data?.data?.id, bvnCheck.data?.data?.id].filter(Boolean).join(",");

  await db.query(
    `UPDATE users
       SET kyc_status='verified',
           kyc_nin=$1,
           kyc_bvn=$2,
           kyc_address=$3,
           kyc_verified_at=NOW(),
           kyc_provider_ref=$4,
           kyc_rejection_reason=NULL
     WHERE id=$5`,
    [nin, bvn, address.trim(), providerRef, userId]
  );

  res.json({ kyc_status: "verified" });
};

export const getKycStatus = async (req, res) => {
  const result = await db.query(
    "SELECT kyc_status, kyc_rejection_reason FROM users WHERE id=$1",
    [req.user.id]
  );
  res.json(result.rows[0] || { kyc_status: null });
};

const markRejected = async (userId, reason) => {
  if (!userId) return;
  await db.query(
    "UPDATE users SET kyc_status='rejected', kyc_rejection_reason=$1 WHERE id=$2",
    [reason, userId]
  );
};
