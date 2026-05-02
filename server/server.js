import http from "http";
import app from "./app.js";
import { initSocket } from "./services/socket.js";
import { logger } from "./utils/logger.js";

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

initSocket(server);

server.listen(PORT, () => {
  logger.info(`Suprefax API running on port ${PORT}`);
});
