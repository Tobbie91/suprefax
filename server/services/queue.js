import Queue from "bull";

export const notificationQueue = new Queue("notifications", {
  redis: process.env.REDIS_URL,
});
