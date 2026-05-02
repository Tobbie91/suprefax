import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { db } from "./index.js";

dotenv.config();

const users = [
  { email: "borrower@suprefax.test", password: "password123", role: "borrower", full_name: "Adaeze Okeke" },
  { email: "agent@suprefax.test",    password: "password123", role: "agent",    full_name: "Tunde Bello"   },
  { email: "admin@suprefax.test",    password: "password123", role: "admin",    full_name: "Chidi Admin"   },
];

const seed = async () => {
  for (const u of users) {
    const hashed = await bcrypt.hash(u.password, 10);
    await db.query(
      `INSERT INTO users (email, password, role, full_name)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET password=$2, role=$3, full_name=$4
       RETURNING id, email, role`,
      [u.email, hashed, u.role, u.full_name]
    );
    console.log(`Seeded: ${u.email} (${u.role})`);
  }

  // Get the seeded users so we can create a sample loan
  const borrower = (await db.query("SELECT id FROM users WHERE email=$1", ["borrower@suprefax.test"])).rows[0];
  const agent = (await db.query("SELECT id FROM users WHERE email=$1", ["agent@suprefax.test"])).rows[0];

  // Sample application + repayment so dashboards show data
  const existingApp = await db.query(
    "SELECT id FROM applications WHERE borrower_id=$1 LIMIT 1",
    [borrower.id]
  );

  if (existingApp.rows.length === 0) {
    const app = await db.query(
      `INSERT INTO applications (borrower_id, agent_id, product, amount, status, admin_approved)
       VALUES ($1, $2, 'POF', 50000, 'active', true) RETURNING id`,
      [borrower.id, agent.id]
    );

    await db.query(
      `INSERT INTO repayments (application_id, due_date, amount, status)
       VALUES ($1, CURRENT_DATE + INTERVAL '2 days', 50000, 'due')`,
      [app.rows[0].id]
    );

    await db.query(
      `INSERT INTO notifications (user_id, application_id, message, type, channel)
       VALUES ($1, $2, 'Welcome to Suprefax', 'approval', 'in-app')`,
      [borrower.id, app.rows[0].id]
    );

    console.log(`Sample loan created: ${app.rows[0].id}`);
  }

  console.log("\nLogin with any of these:");
  users.forEach((u) => console.log(`  ${u.email} / ${u.password}`));

  await db.end();
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
