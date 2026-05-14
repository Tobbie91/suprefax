import bcrypt from "bcryptjs";
import { db } from "../db/index.js";

export const getAllApplications = async (req, res) => {
  const { status } = req.query;

  let query = `
    SELECT a.*,
      ub.full_name AS borrower_name,
      ua.full_name AS agent_name
    FROM applications a
    LEFT JOIN users ub ON ub.id = a.borrower_id
    LEFT JOIN users ua ON ua.id = a.agent_id
  `;
  const params = [];

  if (status) {
    query += " WHERE a.status=$1";
    params.push(status);
  }

  query += " ORDER BY a.created_at DESC";

  const result = await db.query(query, params);
  res.json(result.rows);
};

export const getExtensions = async (req, res) => {
  const result = await db.query(
    `SELECT e.*, u.full_name AS borrower_name
     FROM extensions e
     JOIN applications a ON a.id = e.application_id
     JOIN users u ON u.id = a.borrower_id
     ORDER BY e.created_at DESC`
  );
  res.json(result.rows);
};

export const getAuditLogs = async (req, res) => {
  const result = await db.query(
    "SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 200"
  );
  res.json(result.rows);
};

export const getAnalytics = async (req, res) => {
  const [total, active, overdue] = await Promise.all([
    db.query("SELECT COUNT(*) FROM applications"),
    db.query("SELECT COUNT(*) FROM applications WHERE status='active'"),
    db.query("SELECT COUNT(*) FROM repayments WHERE status='overdue'"),
  ]);

  const totalLoans = parseInt(total.rows[0].count);
  const activeLoans = parseInt(active.rows[0].count);
  const overdueLoans = parseInt(overdue.rows[0].count);

  res.json({
    total_loans: totalLoans,
    active: activeLoans,
    overdue: overdueLoans,
    default_rate: totalLoans > 0 ? overdueLoans / totalLoans : 0,
  });
};

export const listAgents = async (req, res) => {
  const result = await db.query(
    `SELECT u.id, u.email, u.full_name,
       COUNT(DISTINCT a.id) AS customers,
       COALESCE(SUM(a.amount), 0) AS portfolio
     FROM users u
     LEFT JOIN applications a ON a.agent_id = u.id
     WHERE u.role = 'agent'
     GROUP BY u.id, u.email, u.full_name
     ORDER BY u.full_name`
  );
  res.json(result.rows);
};

export const listCustomers = async (req, res) => {
  const result = await db.query(
    `SELECT u.id, u.email, u.full_name,
       a.id AS application_id, a.product, a.amount, a.status,
       r.due_date, r.status AS repayment_status,
       ag.full_name AS agent_name
     FROM users u
     LEFT JOIN applications a ON a.borrower_id = u.id
     LEFT JOIN repayments r ON r.application_id = a.id
     LEFT JOIN users ag ON ag.id = a.agent_id
     WHERE u.role = 'borrower'
     ORDER BY u.full_name`
  );
  res.json(result.rows);
};

export const createAgent = async (req, res) => {
  const { email, password, full_name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const hashed = await bcrypt.hash(password, 10);
  try {
    const result = await db.query(
      "INSERT INTO users (email, password, role, full_name) VALUES ($1,$2,'agent',$3) RETURNING id, email, role, full_name",
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

export const controlNotifications = async (req, res) => {
  const { application_id, paused } = req.body;

  await db.query(
    "UPDATE notifications SET paused=$1 WHERE application_id=$2",
    [paused, application_id]
  );

  res.json({ message: "Updated" });
};
