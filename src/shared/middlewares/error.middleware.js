const createError = require("http-errors");
const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  logger.error(err.message || "Unknown error", {
    correlationId: req.correlationId,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
    headers: Object.fromEntries(
      Object.entries(req.headers || {}).filter(
        ([key]) => !["authorization", "cookie"].includes(key.toLowerCase())
      )
    ),
  });

  // Only handle explicit CORS errors
  if (err.message === "Not allowed by CORS") {
    logger.warn("CORS error", {
      correlationId: req.correlationId,
      origin: req.get("origin") || "unknown",
      method: req.method,
      url: req.originalUrl,
    });
    return res.status(403).json({ error: "CORS policy violation" });
  }

  if (err.isJoi) {
    return res.status(400).json({
      error: "Validation Error",
      details: err.details.map((detail) => detail.message),
    });
  }

  // Return the actual error status and message
  if (err.status) {
    return res.status(err.status).json({ error: err.message });
  }

  res.status(500).json({ error: "Internal Server Error" });
};

module.exports = errorHandler;
