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

app.set("trust proxy", 1);

app.get("/health", (req, res) => res.json({ status: "ok" }));

const allowedOrigins = [
  ...(process.env.FRONTEND_URL || "").split(",").map((s) => s.trim()),
].filter(Boolean);

const LOCALHOST_RE = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || LOCALHOST_RE.test(origin) || allowedOrigins.includes(origin)) {
      return cb(null, true);
    }
    return cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));
app.use(...security);
app.use(express.json());
app.use(requestLogger);
app.use(metricsMiddleware);

app.use("/api", routes);

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

export default app;
