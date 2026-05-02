import { notificationQueue } from "../services/queue.js";
import { db } from "../db/index.js";
import { logger } from "../utils/logger.js";

notificationQueue.process(async (job) => {
  const { user_id, message, type } = job.data;

  await db.query(
    "INSERT INTO notifications (user_id, message, type) VALUES ($1,$2,$3)",
    [user_id, message, type || "in-app"]
  );

  logger.info("Notification sent", { user_id, message });
});

notificationQueue.on("completed", (job) => {
  logger.info("Job completed", { id: job.id });
});

notificationQueue.on("failed", (job, err) => {
  logger.error("Job failed", { id: job.id, error: err.message });
});
