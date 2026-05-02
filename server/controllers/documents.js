import { db } from "../db/index.js";

export const getDocument = async (req, res) => {
  const { id } = req.params;

  const app = await db.query(
    "SELECT admin_approved FROM applications WHERE id=$1",
    [id]
  );
  if (!app.rows[0]) return res.status(404).json({ message: "Not found" });

  const sigs = await db.query(
    "SELECT signed FROM signatures WHERE application_id=$1",
    [id]
  );

  const allSigned = sigs.rows.length > 0 && sigs.rows.every((s) => s.signed);
  const adminApproved = app.rows[0].admin_approved;

  if (!allSigned) {
    return res.json({ status: "locked", reason: "Pending signatures" });
  }

  if (!adminApproved) {
    return res.json({ status: "locked", reason: "Awaiting admin approval" });
  }

  res.json({
    status: "available",
    url: `/api/documents/${id}/download`,
    reason: null,
  });
};
