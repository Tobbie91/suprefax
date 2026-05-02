import { db } from "../db/index.js";

export const getBorrowerApplications = async (req, res) => {
  const result = await db.query(
    `SELECT a.*,
       ag.full_name AS agent_name,
       r.due_date, r.status AS repayment_status, r.amount AS repayment_amount
     FROM applications a
     LEFT JOIN users ag ON ag.id = a.agent_id
     LEFT JOIN repayments r ON r.application_id = a.id
     WHERE a.borrower_id = $1
     ORDER BY a.created_at DESC`,
    [req.user.id]
  );
  res.json(result.rows);
};

export const getBorrowerExtensions = async (req, res) => {
  const result = await db.query(
    `SELECT e.*
     FROM extensions e
     JOIN applications a ON a.id = e.application_id
     WHERE a.borrower_id = $1
     ORDER BY e.created_at DESC`,
    [req.user.id]
  );
  res.json(result.rows);
};

export const createBorrowerApplication = async (req, res) => {
  const { product, amount } = req.body;

  if (!product || !amount) {
    return res.status(400).json({ message: "product and amount are required" });
  }

  // Auto-assign first available agent
  const agentResult = await db.query(
    "SELECT id FROM users WHERE role = 'agent' ORDER BY created_at LIMIT 1"
  );
  const agent = agentResult.rows[0];
  if (!agent) return res.status(400).json({ message: "No agent available" });

  const result = await db.query(
    `INSERT INTO applications (borrower_id, agent_id, product, amount, status)
     VALUES ($1, $2, $3, $4, 'pending') RETURNING *`,
    [req.user.id, agent.id, product, Number(amount)]
  );

  // Seed the three party signatures so the signature tracker has rows
  const app = result.rows[0];
  await db.query(
    `INSERT INTO signatures (application_id, party, signed) VALUES
     ($1, 'borrower', false), ($1, 'agent', false), ($1, 'admin', false)`,
    [app.id]
  );

  res.status(201).json(app);
};

export const getBorrowerRepayments = async (req, res) => {
  const result = await db.query(
    `SELECT r.id, r.application_id, r.due_date, r.amount, r.status
     FROM repayments r
     JOIN applications a ON a.id = r.application_id
     WHERE a.borrower_id=$1
     ORDER BY r.due_date ASC`,
    [req.user.id]
  );
  res.json(result.rows);
};

export const getBorrowerNotifications = async (req, res) => {
  const result = await db.query(
    `SELECT * FROM notifications
     WHERE user_id=$1 AND paused=false
     ORDER BY created_at DESC
     LIMIT 50`,
    [req.user.id]
  );
  res.json(result.rows);
};
