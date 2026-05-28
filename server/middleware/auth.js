import jwt from "jsonwebtoken";
import { db } from "../db/index.js";

export const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.sendStatus(401);

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.sendStatus(401);
  }
};

export const authorize = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) return res.sendStatus(403);
  next();
};

export const requireVerifiedKyc = async (req, res, next) => {
  if (req.user.role === "admin") return next();
  const result = await db.query("SELECT kyc_status FROM users WHERE id=$1", [req.user.id]);
  const status = result.rows[0]?.kyc_status;
  if (status !== "verified") {
    return res.status(403).json({ message: "KYC not verified", kyc_status: status || "pending" });
  }
  next();
};

export const requireVerifiedAgent = requireVerifiedKyc;
