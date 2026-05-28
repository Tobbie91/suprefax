import { db } from "../db/index.js";
import { verifyNIN, verifyBVN } from "../services/kyc.js";

const NIN_RE = /^\d{11}$/;
const BVN_RE = /^\d{11}$/;

export const submitKyc = async (req, res) => {
  const userId = req.user?.id;
  const { nin, bvn, address } = req.body || {};

  if (!NIN_RE.test(nin || "")) {
    return res.status(400).json({ message: "NIN must be 11 digits." });
  }
  if (!BVN_RE.test(bvn || "")) {
    return res.status(400).json({ message: "BVN must be 11 digits." });
  }
  if (!address || address.trim().length < 5) {
    return res.status(400).json({ message: "Address is required." });
  }

  const ninCheck = await verifyNIN(nin);
  if (!ninCheck.ok) {
    await markRejected(userId, `NIN lookup failed: ${ninCheck.data?.message || "unknown"}`);
    return res.status(400).json({ message: "NIN verification failed.", details: ninCheck.data });
  }

  const bvnCheck = await verifyBVN(bvn);
  if (!bvnCheck.ok) {
    await markRejected(userId, `BVN lookup failed: ${bvnCheck.data?.message || "unknown"}`);
    return res.status(400).json({ message: "BVN verification failed.", details: bvnCheck.data });
  }

  const ninRef = ninCheck.data?.data?.nin || ninCheck.data?.data?.id || null;
  const bvnRef = bvnCheck.data?.data?.bvn || bvnCheck.data?.data?.id || null;
  const providerRef = [ninRef, bvnRef].filter(Boolean).join(",");

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
