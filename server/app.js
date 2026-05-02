import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { security } from "./middleware/security.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { metricsMiddleware, collectDefaultMetrics, register } from "./services/metrics.js";
import routes from "./routes/index.js";

dotenv.config();

collectDefaultMetrics();

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(...security);
app.use(express.json());
app.use(requestLogger);
app.use(metricsMiddleware);

app.use("/api", routes);

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.get("/health", (req, res) => res.json({ status: "ok" }));

export default app;
