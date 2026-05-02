import { notificationQueue } from "./queue.js";

export const sendNotification = async (user_id, message, type = "in-app") => {
  await notificationQueue.add({ user_id, message, type });
};
