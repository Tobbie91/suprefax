import { db } from "../db/index.js";

export const getBorrowerApplications = async (req, res) => {
  const result = await db.query(
    `SELECT a.*,
       ag.full_name AS agent_name,
       r.due_date, r.status AS repayment_status, r.amount AS repayment_amount
     FROM applications a
     LEFT JOIN users ag ON ag.id = a.agent_id
     LEFT JOIN repayments r ON r.application_id = a.id
     WHERE a.borrower_id = $1 AND a.status <> 'draft'
     ORDER BY a.created_at DESC`,
    [req.user.id]
  );
  res.json(result.rows);
};

export const getBorrowerDrafts = async (req, res) => {
  const draftsResult = await db.query(
    `SELECT * FROM applications
     WHERE borrower_id=$1 AND status='draft'
     ORDER BY created_at DESC`,
    [req.user.id]
  );
  const drafts = draftsResult.rows;
  if (drafts.length === 0) return res.json([]);
  const ids = drafts.map((d) => d.id);
  const docsResult = await db.query(
    `SELECT application_id, doc_type, cloudinary_url, id, uploaded_at
     FROM application_documents
     WHERE application_id = ANY($1::uuid[])`,
    [ids]
  );
  const docsByApp = new Map();
  for (const d of docsResult.rows) {
    if (!docsByApp.has(d.application_id)) docsByApp.set(d.application_id, []);
    docsByApp.get(d.application_id).push(d);
  }
  res.json(drafts.map((d) => ({ ...d, documents: docsByApp.get(d.id) || [] })));
};

export const createDraft = async (req, res) => {
  const result = await db.query(
    `INSERT INTO applications (borrower_id, status)
     VALUES ($1, 'draft') RETURNING *`,
    [req.user.id]
  );
  res.status(201).json(result.rows[0]);
};

const DRAFT_UPDATABLE = new Set([
  "product", "amount", "duration_days", "purpose",
  "int_passport_no", "borrower_address",
  "bank_name", "bank_account_number", "bank_account_name",
  "nok_name", "nok_phone", "nok_address", "nok_relationship",
  "applicant_type", "agent_route", "has_sponsor",
  "visa_reference_no", "company_name", "cac_number", "supplier_code", "po_number", "po_expiry",
  "student_id", "course", "school_name", "school_address",
  "destination_country", "destination_state", "travelers_count", "accommodation_type", "accommodation_address",
  "delivery_country", "delivery_state", "delivery_address", "shipping_method",
  "addr_country", "addr_state", "addr_lga", "addr_house_number", "addr_street_name", "addr_city", "addr_landmark", "addr_postal_code",
  "applicant_company_name", "applicant_cac_number", "applicant_company_address",
  "attestation_signed_name", "interest_rate_monthly_pct",
]);

export const updateDraft = async (req, res) => {
  const b = req.body || {};
  const setPairs = [];
  const values = [];
  let paramIdx = 1;
  for (const k of Object.keys(b)) {
    if (!DRAFT_UPDATABLE.has(k)) continue;
    setPairs.push(`${k}=$${paramIdx}`);
    values.push(b[k] === "" ? null : b[k]);
    paramIdx++;
  }
  if (Array.isArray(b.additional_agent_ids)) {
    setPairs.push(`additional_agent_ids=$${paramIdx}`);
    values.push(b.additional_agent_ids.filter(Boolean));
    paramIdx++;
  }
  if (b.agent_id !== undefined) {
    setPairs.push(`agent_id=$${paramIdx}`);
    values.push(b.agent_id || null);
    paramIdx++;
  }
  if (setPairs.length === 0) {
    const cur = await db.query(
      "SELECT * FROM applications WHERE id=$1 AND borrower_id=$2 AND status='draft'",
      [req.params.id, req.user.id]
    );
    if (cur.rows.length === 0) return res.status(404).json({ message: "Draft not found." });
    return res.json(cur.rows[0]);
  }
  values.push(req.params.id, req.user.id);
  const result = await db.query(
    `UPDATE applications
       SET ${setPairs.join(", ")}
     WHERE id=$${paramIdx} AND borrower_id=$${paramIdx + 1} AND status='draft'
     RETURNING *`,
    values
  );
  if (result.rows.length === 0) return res.status(404).json({ message: "Draft not found." });
  res.json(result.rows[0]);
};

export const deleteDraft = async (req, res) => {
  const result = await db.query(
    `DELETE FROM applications
     WHERE id=$1 AND borrower_id=$2 AND status='draft'
     RETURNING id`,
    [req.params.id, req.user.id]
  );
  if (result.rows.length === 0) return res.status(404).json({ message: "Draft not found." });
  res.json({ deleted: result.rows[0].id });
};

export const submitDraft = async (req, res) => {
  const cur = await db.query(
    "SELECT * FROM applications WHERE id=$1 AND borrower_id=$2 AND status='draft'",
    [req.params.id, req.user.id]
  );
  if (cur.rows.length === 0) return res.status(404).json({ message: "Draft not found." });
  const a = cur.rows[0];
  const missing = CORE_REQUIRED
    .filter((k) => k !== "declaration_accepted")
    .filter((k) => a[k] === undefined || a[k] === "" || a[k] === null);
  const declarationOk = req.body?.declaration_accepted === true;
  if (missing.length > 0) {
    return res.status(400).json({ message: `Draft incomplete: ${missing.join(", ")}`, missing });
  }
  if (!declarationOk) {
    return res.status(400).json({ message: "You must accept the declaration." });
  }
  if (a.applicant_type === "individual" && !/^\d{10}$/.test(a.bank_account_number || "")) {
    return res.status(400).json({ message: "Applicant bank account number must be exactly 10 digits.", field: "bank_account_number" });
  }
  if (a.applicant_type === "corporate" && !/^\d{10}$/.test(a.applicant_bank_account_number || "")) {
    return res.status(400).json({ message: "Company bank account number must be exactly 10 digits.", field: "applicant_bank_account_number" });
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    // Nested inserts: sponsor + directors + witness + applicant directors
    // (any prior rows are cleaned first so re-submits are idempotent)
    await client.query("DELETE FROM application_sponsor_directors WHERE sponsor_id IN (SELECT id FROM application_sponsors WHERE application_id=$1)", [a.id]);
    await client.query("DELETE FROM application_sponsors WHERE application_id=$1", [a.id]);
    await client.query("DELETE FROM application_witnesses WHERE application_id=$1", [a.id]);
    await client.query("DELETE FROM application_applicant_directors WHERE application_id=$1", [a.id]);

    const s = req.body?.sponsor;
    if (a.has_sponsor && s) {
      const sponsorRes = await client.query(
        `INSERT INTO application_sponsors (
           application_id, sponsor_type, full_name, nin, bvn, phone, email, passport_no, relationship,
           bank_name, bank_account_number, bank_account_name,
           country, state, lga, house_number, street_name, city,
           disclaimer_confirmed_at
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
         RETURNING id`,
        [
          a.id, s.sponsor_type || "personal", s.full_name || null, s.nin || null, s.bvn || null, s.phone || null, s.email || null, s.passport_no || null, s.relationship || null,
          s.bank_name || null, s.bank_account_number || null, s.bank_account_name || null,
          s.country || null, s.state || null, s.lga || null, s.house_number || null, s.street_name || null, s.city || null,
          s.disclaimer_confirmed ? new Date() : null,
        ]
      );
      const sponsorId = sponsorRes.rows[0].id;
      for (const d of s.directors || []) {
        await client.query(
          `INSERT INTO application_sponsor_directors (sponsor_id, full_name, nin, phone, email, bank_name, bank_account_number, bank_account_name, country, state, disclaimer_confirmed_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
          [sponsorId, d.full_name || null, d.nin || null, d.phone || null, d.email || null, d.bank_name || null, d.bank_account_number || null, d.bank_account_name || null, d.country || null, d.state || null, d.disclaimer_confirmed ? new Date() : null]
        );
      }
      if (s.witness && s.witness.full_name) {
        await client.query(
          `INSERT INTO application_witnesses (application_id, witnessee_type, full_name, nin, phone, email, passport_no, confirmed_at)
           VALUES ($1, 'sponsor', $2, $3, $4, $5, $6, $7)`,
          [a.id, s.witness.full_name, s.witness.nin || null, s.witness.phone || null, s.witness.email || null, s.witness.passport_no || null, s.witness.confirmed ? new Date() : null]
        );
      }
    }

    for (const d of req.body?.applicant_directors || []) {
      await client.query(
        `INSERT INTO application_applicant_directors (application_id, full_name, nin, phone, email, bank_name, bank_account_number, bank_account_name, country, state, disclaimer_confirmed_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [a.id, d.full_name || null, d.nin || null, d.phone || null, d.email || null, d.bank_name || null, d.bank_account_number || null, d.bank_account_name || null, d.country || null, d.state || null, d.disclaimer_confirmed ? new Date() : null]
      );
    }

    const result = await client.query(
      `UPDATE applications
         SET status='awaiting_quote',
             declaration_accepted_at=NOW(),
             attestation_signed_at=COALESCE(attestation_signed_at, NOW())
       WHERE id=$1
       RETURNING *`,
      [a.id]
    );

    await client.query("COMMIT");
    res.json(result.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
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

const CORE_REQUIRED = ["product", "amount", "duration_days", "purpose", "applicant_type", "agent_route", "declaration_accepted"];

export const createBorrowerApplication = async (req, res) => {
  const b = req.body || {};
  const missing = CORE_REQUIRED.filter((k) => b[k] === undefined || b[k] === "" || b[k] === null);
  if (missing.length > 0) {
    return res.status(400).json({ message: `Missing required fields: ${missing.join(", ")}` });
  }
  if (b.declaration_accepted !== true) {
    return res.status(400).json({ message: "You must accept the declaration." });
  }
  if (b.agent_route === "agent_assisted" && !b.agent_id) {
    return res.status(400).json({ message: "Please select an agent." });
  }

  if (b.agent_id) {
    const agentCheck = await db.query(
      "SELECT id FROM users WHERE id=$1 AND role='agent' AND kyc_status='verified'",
      [b.agent_id]
    );
    if (agentCheck.rows.length === 0) {
      return res.status(400).json({ message: "Selected agent is not available." });
    }
  }

  // Bank account number format validation (Nigerian NUBAN = 10 digits)
  const accountFields = [
    { key: "bank_account_number", label: "Applicant bank account number", value: b.bank_account_number, required: b.applicant_type === "individual" },
    { key: "applicant_bank_account_number", label: "Applicant company bank account number", value: b.applicant_bank_account_number, required: b.applicant_type === "corporate" },
  ];
  for (const f of accountFields) {
    if (!f.required) continue;
    if (!/^\d{10}$/.test(f.value || "")) {
      return res.status(400).json({ message: `${f.label} must be exactly 10 digits.`, field: f.key });
    }
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const additionalAgents = Array.isArray(b.additional_agent_ids) ? b.additional_agent_ids.filter(Boolean) : [];

    const appResult = await client.query(
      `INSERT INTO applications (
         borrower_id, agent_id, product, amount, duration_days, purpose,
         int_passport_no, borrower_address,
         bank_name, bank_account_number, bank_account_name,
         nok_name, nok_phone, nok_address, nok_relationship,
         applicant_type, agent_route, has_sponsor, additional_agent_ids,
         visa_reference_no, company_name, cac_number, supplier_code, po_number, po_expiry,
         student_id, course, school_name, school_address,
         destination_country, destination_state, travelers_count, accommodation_type, accommodation_address,
         delivery_country, delivery_state, delivery_address, shipping_method,
         addr_country, addr_state, addr_lga, addr_house_number, addr_street_name, addr_city, addr_landmark, addr_postal_code,
         applicant_company_name, applicant_cac_number, applicant_company_address,
         attestation_signed_name, attestation_signed_at,
         declaration_accepted_at, status
       ) VALUES (
         $1, $2, $3, $4, $5, $6,
         $7, $8,
         $9, $10, $11,
         $12, $13, $14, $15,
         $16, $17, $18, $19,
         $20, $21, $22, $23, $24, $25,
         $26, $27, $28, $29,
         $30, $31, $32, $33, $34,
         $35, $36, $37, $38,
         $39, $40, $41, $42, $43, $44, $45, $46,
         $47, $48, $49,
         $50, $51,
         NOW(), 'awaiting_quote'
       ) RETURNING *`,
      [
        req.user.id, b.agent_id || null, b.product, Number(b.amount), Number(b.duration_days), b.purpose,
        b.int_passport_no || null, b.borrower_address || null,
        b.bank_name || null, b.bank_account_number || null, b.bank_account_name || null,
        b.nok_name || null, b.nok_phone || null, b.nok_address || null, b.nok_relationship || null,
        b.applicant_type, b.agent_route, !!b.has_sponsor, additionalAgents,
        b.visa_reference_no || null, b.company_name || null, b.cac_number || null, b.supplier_code || null, b.po_number || null, b.po_expiry || null,
        b.student_id || null, b.course || null, b.school_name || null, b.school_address || null,
        b.destination_country || null, b.destination_state || null, b.travelers_count ? Number(b.travelers_count) : null, b.accommodation_type || null, b.accommodation_address || null,
        b.delivery_country || null, b.delivery_state || null, b.delivery_address || null, b.shipping_method || null,
        b.addr_country || null, b.addr_state || null, b.addr_lga || null, b.addr_house_number || null, b.addr_street_name || null, b.addr_city || null, b.addr_landmark || null, b.addr_postal_code || null,
        b.applicant_company_name || null, b.applicant_cac_number || null, b.applicant_company_address || null,
        b.attestation_signed_name || null, b.attestation_signed_name ? new Date() : null,
      ]
    );

    const app = appResult.rows[0];

    if (b.interest_rate_monthly_pct != null && !Number.isNaN(Number(b.interest_rate_monthly_pct))) {
      await client.query(
        "UPDATE applications SET interest_rate_monthly_pct=$1 WHERE id=$2",
        [Number(b.interest_rate_monthly_pct), app.id]
      );
      app.interest_rate_monthly_pct = Number(b.interest_rate_monthly_pct);
    }

    if (b.has_sponsor && b.sponsor) {
      const s = b.sponsor;
      const sponsorRes = await client.query(
        `INSERT INTO application_sponsors (
           application_id, sponsor_type, full_name, nin, bvn, phone, email, passport_no, relationship,
           bank_name, bank_account_number, bank_account_name,
           country, state, lga, house_number, street_name, city,
           disclaimer_confirmed_at
         ) VALUES (
           $1, $2, $3, $4, $5, $6, $7, $8, $9,
           $10, $11, $12,
           $13, $14, $15, $16, $17, $18,
           $19
         ) RETURNING id`,
        [
          app.id, s.sponsor_type || "personal", s.full_name || null, s.nin || null, s.bvn || null, s.phone || null, s.email || null, s.passport_no || null, s.relationship || null,
          s.bank_name || null, s.bank_account_number || null, s.bank_account_name || null,
          s.country || null, s.state || null, s.lga || null, s.house_number || null, s.street_name || null, s.city || null,
          s.disclaimer_confirmed ? new Date() : null,
        ]
      );
      const sponsorId = sponsorRes.rows[0].id;

      for (const d of s.directors || []) {
        await client.query(
          `INSERT INTO application_sponsor_directors (
             sponsor_id, full_name, nin, phone, email,
             bank_name, bank_account_number, bank_account_name,
             country, state, disclaimer_confirmed_at
           ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
          [
            sponsorId, d.full_name || null, d.nin || null, d.phone || null, d.email || null,
            d.bank_name || null, d.bank_account_number || null, d.bank_account_name || null,
            d.country || null, d.state || null, d.disclaimer_confirmed ? new Date() : null,
          ]
        );
      }

      if (s.witness && s.witness.full_name) {
        await client.query(
          `INSERT INTO application_witnesses (application_id, witnessee_type, full_name, nin, phone, email, passport_no, confirmed_at)
           VALUES ($1, 'sponsor', $2, $3, $4, $5, $6, $7)`,
          [
            app.id, s.witness.full_name, s.witness.nin || null, s.witness.phone || null,
            s.witness.email || null, s.witness.passport_no || null,
            s.witness.confirmed ? new Date() : null,
          ]
        );
      }
    }

    for (const d of b.applicant_directors || []) {
      await client.query(
        `INSERT INTO application_applicant_directors (
           application_id, full_name, nin, phone, email,
           bank_name, bank_account_number, bank_account_name,
           country, state, disclaimer_confirmed_at
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [
          app.id, d.full_name || null, d.nin || null, d.phone || null, d.email || null,
          d.bank_name || null, d.bank_account_number || null, d.bank_account_name || null,
          d.country || null, d.state || null, d.disclaimer_confirmed ? new Date() : null,
        ]
      );
    }

    await client.query("COMMIT");
    res.status(201).json(app);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
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
