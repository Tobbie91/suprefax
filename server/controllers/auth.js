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
    user: { id: user.id, role: user.role, email: user.email, name: user.full_name },
  });
};

export const register = async (req, res) => {
  const { email, password, role, full_name } = req.body;

  const hashed = await bcrypt.hash(password, 10);
  const result = await db.query(
    "INSERT INTO users (email, password, role, full_name) VALUES ($1,$2,$3,$4) RETURNING id, email, role, full_name",
    [email, hashed, role, full_name]
  );

  res.status(201).json(result.rows[0]);
};
