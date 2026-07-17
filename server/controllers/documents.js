import { db } from "../db/index.js";
import { uploadBuffer } from "../services/cloudinary.js";

const ALLOWED_DOC_TYPES = new Set([
  "gov_id",
  "bank_statement",
  "proof_of_address",
  "product_specific",
  "additional",
  "admission_receipt",
  "deposit_receipt",
  "passport_photo",
  "sponsor_cac",
  "applicant_cac",
  "signature",
]);

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

export const listApplicationDocuments = async (req, res) => {
  const auth = await db.query(
    "SELECT borrower_id, agent_id FROM applications WHERE id=$1",
    [req.params.id]
  );
  if (auth.rows.length === 0) return res.status(404).json({ message: "Not found" });
  const a = auth.rows[0];
  const allowed =
    req.user.role === "admin" ||
    a.borrower_id === req.user.id ||
    a.agent_id === req.user.id;
  if (!allowed) return res.status(403).json({ message: "Forbidden" });

  const result = await db.query(
    "SELECT id, doc_type, cloudinary_url, uploaded_at FROM application_documents WHERE application_id=$1 ORDER BY uploaded_at",
    [req.params.id]
  );
  res.json(result.rows);
};

export const deleteApplicationDocument = async (req, res) => {
  const { id, docId } = req.params;

  const owner = await db.query(
    `SELECT ad.id FROM application_documents ad
     JOIN applications a ON a.id = ad.application_id
     WHERE ad.id=$1 AND ad.application_id=$2 AND a.borrower_id=$3`,
    [docId, id, req.user.id]
  );
  if (owner.rows.length === 0) return res.status(404).json({ message: "Document not found." });

  await db.query("DELETE FROM application_documents WHERE id=$1", [docId]);
  res.json({ deleted: docId });
};

export const uploadApplicationDocument = async (req, res) => {
  const { id } = req.params;
  const docType = req.body?.doc_type;

  if (!ALLOWED_DOC_TYPES.has(docType)) {
    return res.status(400).json({ message: "Invalid doc_type." });
  }
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded." });
  }

  const app = await db.query(
    "SELECT id, borrower_id FROM applications WHERE id=$1",
    [id]
  );
  if (app.rows.length === 0) return res.status(404).json({ message: "Application not found." });
  if (app.rows[0].borrower_id !== req.user.id) {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    const result = await uploadBuffer(
      req.file.buffer,
      `suprefax/applications/${id}`,
      `${docType}-${Date.now()}`
    );
    const inserted = await db.query(
      `INSERT INTO application_documents (application_id, doc_type, cloudinary_url)
       VALUES ($1, $2, $3) RETURNING id, doc_type, cloudinary_url, uploaded_at`,
      [id, docType, result.secure_url]
    );
    res.status(201).json(inserted.rows[0]);
  } catch (err) {
    res.status(502).json({ message: "Upload failed", details: err.message });
  }
};
