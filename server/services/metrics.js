import client from "prom-client";

export const collectDefaultMetrics = client.collectDefaultMetrics;

export const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status"],
});

export const metricsMiddleware = (req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on("finish", () => {
    end({ method: req.method, route: req.route?.path || req.url, status: res.statusCode });
  });
  next();
};

export const register = client.register;
