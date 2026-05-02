import { db } from "../db/index.js";

export const audit = (action, entity) => async (req, res, next) => {
  try {
    await db.query(
      "INSERT INTO audit_logs (actor_id, action, entity) VALUES ($1,$2,$3)",
      [req.user?.id || null, action, entity]
    );
  } catch {
    // audit failures must not block the request
  }
  next();
};
