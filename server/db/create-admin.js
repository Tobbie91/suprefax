import bcrypt from "bcryptjs";
import { db } from "./index.js";

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
const fullName = process.env.ADMIN_NAME || "Admin";

if (!email || !password) {
  console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD env vars before running this script.");
  console.error('Example: ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=secret ADMIN_NAME="Your Name" npm run create-admin');
  process.exit(1);
}

const run = async () => {
  const hashed = await bcrypt.hash(password, 10);
  const result = await db.query(
    `INSERT INTO users (email, password, role, full_name)
     VALUES ($1, $2, 'admin', $3)
     ON CONFLICT (email) DO UPDATE SET password=$2, role='admin', full_name=$3
     RETURNING id, email, role, full_name`,
    [email, hashed, fullName]
  );
  console.log("Admin user ready:", result.rows[0]);
  await db.end();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
