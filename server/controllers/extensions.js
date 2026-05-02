import { db } from "../db/index.js";
import { logger } from "../utils/logger.js";

export const requestExtension = async (req, res) => {
  const { application_id, new_date, reason } = req.body;

  await db.query(
    `INSERT INTO extensions (application_id, new_date, reason)
     VALUES ($1,$2,$3)`,
    [application_id, new_date, reason]
  );

  logger.info("AUDIT", {
    actor: req.user.id,
    action: "REQUESTED_EXTENSION",
    entity: application_id,
  });

  res.status(201).json({ message: "Extension requested" });
};

export const approveExtension = async (req, res) => {
  const { id } = req.params;

  const ext = await db.query("SELECT * FROM extensions WHERE id=$1", [id]);
  if (!ext.rows[0]) return res.status(404).json({ message: "Not found" });

  await db.query("UPDATE extensions SET status='approved' WHERE id=$1", [id]);

  await db.query(
    "UPDATE repayments SET due_date=$1 WHERE application_id=$2",
    [ext.rows[0].new_date, ext.rows[0].application_id]
  );

  await db.query(
    "UPDATE notifications SET paused=true WHERE application_id=$1",
    [ext.rows[0].application_id]
  );

  await db.query(
    "INSERT INTO audit_logs (actor_id, action, entity) VALUES ($1,$2,$3)",
    [req.user.id, "APPROVED_EXTENSION", ext.rows[0].application_id]
  );

  logger.info("AUDIT", {
    actor: req.user.id,
    action: "APPROVED_EXTENSION",
    entity: ext.rows[0].application_id,
  });

  res.json({ message: "Approved" });
};

export const declineExtension = async (req, res) => {
  const { id } = req.params;

  const ext = await db.query("SELECT * FROM extensions WHERE id=$1", [id]);
  if (!ext.rows[0]) return res.status(404).json({ message: "Not found" });

  await db.query("UPDATE extensions SET status='declined' WHERE id=$1", [id]);

  await db.query(
    "INSERT INTO audit_logs (actor_id, action, entity) VALUES ($1,$2,$3)",
    [req.user.id, "DECLINED_EXTENSION", ext.rows[0].application_id]
  );

  res.json({ message: "Declined" });
};
