import { db } from "../db/index.js";
import { sendNotification } from "./notificationTrigger.js";

export const runNotifications = async () => {
  const due48 = await db.query(
    `SELECT r.*, a.borrower_id AS user_id
     FROM repayments r
     JOIN applications a ON a.id = r.application_id
     WHERE r.due_date = CURRENT_DATE + INTERVAL '2 days'
       AND r.status != 'paid'`
  );

  for (const loan of due48.rows) {
    await sendNotification(loan.user_id, "Payment due in 48 hours", "48hr");
  }

  const due24 = await db.query(
    `SELECT r.*, a.borrower_id AS user_id
     FROM repayments r
     JOIN applications a ON a.id = r.application_id
     WHERE r.due_date = CURRENT_DATE + INTERVAL '1 day'
       AND r.status != 'paid'`
  );

  for (const loan of due24.rows) {
    await sendNotification(loan.user_id, "Payment due in 24 hours", "24hr");
  }

  const overdue = await db.query(
    `SELECT r.*, a.borrower_id AS user_id
     FROM repayments r
     JOIN applications a ON a.id = r.application_id
     WHERE r.due_date < CURRENT_DATE
       AND r.status = 'due'`
  );

  for (const loan of overdue.rows) {
    await db.query("UPDATE repayments SET status='overdue' WHERE id=$1", [loan.id]);
    await sendNotification(loan.user_id, "Your payment is overdue", "overdue");
  }
};
