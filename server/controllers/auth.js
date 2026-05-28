import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db/index.js";

export const login = async (req, res) => {
  const { email, password } = req.body;

  const result = await db.query("SELECT * FROM users WHERE email=$1", [email]);
  const user = result.rows[0];

  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    token,
    user: {
      id: user.id,
      role: user.role,
      email: user.email,
      name: user.full_name,
      kyc_status: user.kyc_status,
    },
  });
};

export const bootstrapAdmin = async (req, res) => {
  const { email, password, full_name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const existing = await db.query("SELECT 1 FROM users WHERE role='admin' LIMIT 1");
  if (existing.rows.length > 0) {
    return res.status(403).json({ message: "Admin already exists. This endpoint is disabled." });
  }

  const hashed = await bcrypt.hash(password, 10);
  try {
    const result = await db.query(
      "INSERT INTO users (email, password, role, full_name) VALUES ($1,$2,'admin',$3) RETURNING id, email, role, full_name",
      [email, hashed, full_name || "Admin"]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ message: "Email already in use" });
    }
    throw err;
  }
};

export const register = async (req, res) => {
  const { email, password, full_name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const hashed = await bcrypt.hash(password, 10);
  try {
    const result = await db.query(
      "INSERT INTO users (email, password, role, full_name, kyc_status) VALUES ($1,$2,'borrower',$3,'pending') RETURNING id, email, role, full_name",
      [email, hashed, full_name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ message: "Email already in use" });
    }
    throw err;
  }
};
