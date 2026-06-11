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

const REQUIRED_FIELDS = [
  "agent_id", "product", "amount", "duration_days", "purpose",
  "int_passport_no", "borrower_address",
  "bank_name", "bank_account_number", "bank_account_name",
  "nok_name", "nok_phone", "nok_address", "nok_relationship",
  "declaration_accepted",
];

export const createBorrowerApplication = async (req, res) => {
  const b = req.body || {};
  const missing = REQUIRED_FIELDS.filter((k) => b[k] === undefined || b[k] === "" || b[k] === null);
  if (missing.length > 0) {
    return res.status(400).json({ message: `Missing required fields: ${missing.join(", ")}` });
  }
  if (b.declaration_accepted !== true) {
    return res.status(400).json({ message: "You must accept all declarations." });
  }

  const agentCheck = await db.query(
    "SELECT id FROM users WHERE id=$1 AND role='agent' AND kyc_status='verified'",
    [b.agent_id]
  );
  if (agentCheck.rows.length === 0) {
    return res.status(400).json({ message: "Selected agent is not available." });
  }

  const result = await db.query(
    `INSERT INTO applications (
       borrower_id, agent_id, product, amount, duration_days, purpose,
       int_passport_no, borrower_address,
       bank_name, bank_account_number, bank_account_name,
       nok_name, nok_phone, nok_address, nok_relationship,
       declaration_accepted_at, status
     ) VALUES (
       $1, $2, $3, $4, $5, $6,
       $7, $8,
       $9, $10, $11,
       $12, $13, $14, $15,
       NOW(), 'awaiting_quote'
     ) RETURNING *`,
    [
      req.user.id, b.agent_id, b.product, Number(b.amount), Number(b.duration_days), b.purpose,
      b.int_passport_no, b.borrower_address,
      b.bank_name, b.bank_account_number, b.bank_account_name,
      b.nok_name, b.nok_phone, b.nok_address, b.nok_relationship,
    ]
  );

  res.status(201).json(result.rows[0]);
};

export const acceptQuote = async (req, res) => {
  const result = await db.query(
    `UPDATE applications
       SET status='quote_accepted', borrower_decision_at=NOW()
     WHERE id=$1 AND borrower_id=$2 AND status='quote_sent'
     RETURNING *`,
    [req.params.id, req.user.id]
  );
  if (result.rows.length === 0) {
    return res.status(404).json({ message: "No quote to accept on this application." });
  }
  res.json(result.rows[0]);
};

export const declineQuote = async (req, res) => {
  const result = await db.query(
    `UPDATE applications
       SET status='quote_declined', borrower_decision_at=NOW()
     WHERE id=$1 AND borrower_id=$2 AND status='quote_sent'
     RETURNING *`,
    [req.params.id, req.user.id]
  );
  if (result.rows.length === 0) {
    return res.status(404).json({ message: "No quote to decline on this application." });
  }
  res.json(result.rows[0]);
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
