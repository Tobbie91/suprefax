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
    `SELECT a.*, u.full_name AS borrower_name, u.email AS borrower_email,
            r.due_date, r.status AS repayment_status
     FROM applications a
     LEFT JOIN users u ON u.id = a.borrower_id
     LEFT JOIN repayments r ON r.application_id = a.id
     WHERE a.agent_id=$1
     ORDER BY a.created_at DESC`,
    [req.user.id]
  );

  const rows = result.rows.map((row) => ({
    application_id: row.id,
    borrower_id: row.borrower_id,
    borrower_name: row.borrower_name,
    borrower_email: row.borrower_email,
    product: row.product,
    amount: row.amount,
    purpose: row.purpose,
    duration_days: row.duration_days,
    int_passport_no: row.int_passport_no,
    borrower_address: row.borrower_address,
    bank_name: row.bank_name,
    bank_account_number: row.bank_account_number,
    bank_account_name: row.bank_account_name,
    nok_name: row.nok_name,
    nok_phone: row.nok_phone,
    nok_address: row.nok_address,
    nok_relationship: row.nok_relationship,
    interest_rate_monthly_pct: row.interest_rate_monthly_pct,
    total_repayable_naira: row.total_repayable_naira,
    quoted_at: row.quoted_at,
    created_at: row.created_at,
    due_date: row.due_date,
    status: row.status,
    repayment_status: row.repayment_status,
  }));

  res.json(rows);
};

export const quoteApplication = async (req, res) => {
  const { interest_rate_monthly_pct, duration_days } = req.body || {};
  const rate = Number(interest_rate_monthly_pct);
  const days = Number(duration_days);

  if (!Number.isFinite(rate) || rate <= 0) {
    return res.status(400).json({ message: "interest_rate_monthly_pct must be a positive number." });
  }
  if (!Number.isFinite(days) || days <= 0) {
    return res.status(400).json({ message: "duration_days must be a positive number." });
  }

  const app = await db.query(
    "SELECT id, amount FROM applications WHERE id=$1 AND agent_id=$2 AND status='awaiting_quote'",
    [req.params.id, req.user.id]
  );
  if (app.rows.length === 0) {
    return res.status(404).json({ message: "No application awaiting your quote." });
  }
  const principal = Number(app.rows[0].amount);
  const months = days / 30;
  const totalRepayable = principal * (1 + (rate / 100) * months);

  const result = await db.query(
    `UPDATE applications
       SET interest_rate_monthly_pct=$1,
           duration_days=$2,
           total_repayable_naira=$3,
           quoted_at=NOW(),
           status='quote_sent'
     WHERE id=$4
     RETURNING *`,
    [rate, days, totalRepayable, req.params.id]
  );
  res.json(result.rows[0]);
};

export const getLoanBaselines = async (_req, res) => {
  const result = await db.query(
    "SELECT product_key, duration_days, baseline_monthly_rate_pct FROM loan_baselines ORDER BY product_key, duration_days"
  );
  res.json(result.rows);
};

export const listVerifiedAgents = async (_req, res) => {
  const result = await db.query(
    "SELECT id, full_name, email FROM users WHERE role='agent' AND kyc_status='verified' ORDER BY full_name"
  );
  res.json(result.rows);
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
