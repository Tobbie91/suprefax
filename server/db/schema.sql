CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT CHECK (role IN ('borrower','agent','admin')),
  full_name TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS kyc_status TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS kyc_nin TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS kyc_bvn TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS kyc_address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS kyc_verified_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS kyc_provider_ref TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS kyc_rejection_reason TEXT;

UPDATE users SET kyc_status='pending' WHERE role IN ('agent','borrower') AND kyc_status IS NULL;

CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  borrower_id UUID REFERENCES users(id),
  agent_id UUID REFERENCES users(id),
  product TEXT,
  amount NUMERIC,
  status TEXT DEFAULT 'pending',
  admin_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE applications ADD COLUMN IF NOT EXISTS purpose TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS duration_days INTEGER;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS int_passport_no TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS borrower_address TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS bank_name TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS bank_account_number TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS bank_account_name TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS nok_name TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS nok_phone TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS nok_address TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS nok_relationship TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS declaration_accepted_at TIMESTAMP;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS interest_rate_monthly_pct NUMERIC;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS total_repayable_naira NUMERIC;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS quoted_at TIMESTAMP;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS borrower_decision_at TIMESTAMP;

ALTER TABLE applications ADD COLUMN IF NOT EXISTS applicant_type TEXT DEFAULT 'individual';
ALTER TABLE applications ADD COLUMN IF NOT EXISTS agent_route TEXT DEFAULT 'direct';
ALTER TABLE applications ADD COLUMN IF NOT EXISTS has_sponsor BOOLEAN DEFAULT FALSE;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS is_returning_borrower BOOLEAN DEFAULT FALSE;

ALTER TABLE applications ADD COLUMN IF NOT EXISTS visa_reference_no TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS cac_number TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS supplier_code TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS po_number TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS po_expiry DATE;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS student_id TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS course TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS school_name TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS school_address TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS destination_country TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS destination_state TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS travelers_count INTEGER;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS accommodation_type TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS accommodation_address TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS delivery_country TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS delivery_state TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS delivery_address TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS shipping_method TEXT;

ALTER TABLE applications ADD COLUMN IF NOT EXISTS addr_country TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS addr_state TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS addr_lga TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS addr_house_number TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS addr_street_name TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS addr_city TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS addr_landmark TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS addr_postal_code TEXT;

ALTER TABLE applications ADD COLUMN IF NOT EXISTS applicant_company_name TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS applicant_cac_number TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS applicant_company_address TEXT;

ALTER TABLE applications ADD COLUMN IF NOT EXISTS attestation_signed_name TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS attestation_signed_at TIMESTAMP;

CREATE TABLE IF NOT EXISTS application_sponsors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  sponsor_type TEXT NOT NULL,
  full_name TEXT,
  nin TEXT,
  bvn TEXT,
  phone TEXT,
  email TEXT,
  passport_no TEXT,
  relationship TEXT,
  bank_name TEXT,
  bank_account_number TEXT,
  bank_account_name TEXT,
  country TEXT,
  state TEXT,
  lga TEXT,
  house_number TEXT,
  street_name TEXT,
  city TEXT,
  disclaimer_confirmed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sponsors_app ON application_sponsors(application_id);

CREATE TABLE IF NOT EXISTS application_sponsor_directors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sponsor_id UUID REFERENCES application_sponsors(id) ON DELETE CASCADE,
  full_name TEXT,
  nin TEXT,
  phone TEXT,
  email TEXT,
  bank_name TEXT,
  bank_account_number TEXT,
  bank_account_name TEXT,
  country TEXT,
  state TEXT,
  disclaimer_confirmed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sdirectors_sponsor ON application_sponsor_directors(sponsor_id);

CREATE TABLE IF NOT EXISTS application_applicant_directors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  full_name TEXT,
  nin TEXT,
  phone TEXT,
  email TEXT,
  bank_name TEXT,
  bank_account_number TEXT,
  bank_account_name TEXT,
  country TEXT,
  state TEXT,
  disclaimer_confirmed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_adirectors_app ON application_applicant_directors(application_id);

CREATE TABLE IF NOT EXISTS application_witnesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  witnessee_type TEXT NOT NULL,
  full_name TEXT,
  nin TEXT,
  phone TEXT,
  email TEXT,
  passport_no TEXT,
  confirmed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_witnesses_app ON application_witnesses(application_id);

CREATE INDEX IF NOT EXISTS idx_applications_borrower ON applications(borrower_id);
CREATE INDEX IF NOT EXISTS idx_applications_agent ON applications(agent_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);

CREATE TABLE IF NOT EXISTS application_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL,
  cloudinary_url TEXT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appdocs_application ON application_documents(application_id);

CREATE TABLE IF NOT EXISTS loan_baselines (
  product_key TEXT NOT NULL,
  duration_days INTEGER NOT NULL,
  baseline_monthly_rate_pct NUMERIC NOT NULL,
  PRIMARY KEY (product_key, duration_days)
);

INSERT INTO loan_baselines (product_key, duration_days, baseline_monthly_rate_pct) VALUES
  ('Student POF',          30, 8),
  ('Student POF',          60, 7.5),
  ('Student POF',          90, 7),
  ('Travel POF',           30, 10),
  ('Travel POF',           60, 9),
  ('Travel POF',           90, 8.5),
  ('LPO financing',        30, 12),
  ('LPO financing',        60, 11),
  ('LPO financing',        90, 10),
  ('Soft business loan',   30, 9),
  ('Soft business loan',   60, 8.5),
  ('Soft business loan',   90, 8)
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS repayments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES applications(id),
  due_date DATE,
  amount NUMERIC,
  status TEXT DEFAULT 'due'
);

CREATE INDEX IF NOT EXISTS idx_repayments_due ON repayments(due_date);
CREATE INDEX IF NOT EXISTS idx_repayments_application ON repayments(application_id);

CREATE TABLE IF NOT EXISTS extensions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES applications(id),
  new_date DATE,
  reason TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS signatures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES applications(id),
  party TEXT,
  signed BOOLEAN DEFAULT FALSE,
  signed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  application_id UUID,
  message TEXT,
  type TEXT,
  channel TEXT DEFAULT 'in-app',
  paused BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID,
  action TEXT,
  entity TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id TEXT,
  sender_id UUID REFERENCES users(id),
  text TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_room ON messages(room_id);
