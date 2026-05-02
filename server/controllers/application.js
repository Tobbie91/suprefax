import { db } from "../db/index.js";

export const createApplication = async (req, res) => {
  const { borrower_id, agent_id, product, amount } = req.body;

  const result = await db.query(
    `INSERT INTO applications (borrower_id, agent_id, product, amount)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [borrower_id, agent_id, product, amount]
  );

  res.status(201).json(result.rows[0]);
};

export const getAgentApplications = async (req, res) => {
  const result = await db.query(
    `SELECT a.*, u.full_name AS borrower_name, r.due_date, r.status AS repayment_status
     FROM applications a
     LEFT JOIN users u ON u.id = a.borrower_id
     LEFT JOIN repayments r ON r.application_id = a.id
     WHERE a.agent_id=$1
     ORDER BY a.created_at DESC`,
    [req.user.id]
  );

  const rows = result.rows.map((row) => ({
    application_id: row.id,
    borrower_name: row.borrower_name,
    product: row.product,
    amount: row.amount,
    due_date: row.due_date,
    status: row.repayment_status || row.status,
  }));

  res.json(rows);
};

export const getAgentRepayments = async (req, res) => {
  const result = await db.query(
    `SELECT r.*, u.full_name AS borrower_name
     FROM repayments r
     JOIN applications a ON a.id = r.application_id
     JOIN users u ON u.id = a.borrower_id
     WHERE a.agent_id=$1
     ORDER BY r.due_date ASC`,
    [req.user.id]
  );
  res.json(result.rows);
};
