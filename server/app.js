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
  "http://localhost:3000",
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
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
