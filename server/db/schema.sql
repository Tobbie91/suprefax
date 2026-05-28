CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT CHECK (role IN ('borrower','agent','admin')),
  full_name TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

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

CREATE INDEX IF NOT EXISTS idx_applications_borrower ON applications(borrower_id);
CREATE INDEX IF NOT EXISTS idx_applications_agent ON applications(agent_id);

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
