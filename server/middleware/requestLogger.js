import { logger } from "../utils/logger.js";

export const requestLogger = (req, res, next) => {
  logger.info("HTTP Request", {
    method: req.method,
    path: req.url,
    user: req.user?.id,
  });
  next();
};
