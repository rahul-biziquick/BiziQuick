require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");
const YAML = require("yamljs");
const path = require("node:path");
const loggingMiddleware = require("../shared/middlewares/logging.middleware");
const errorHandler = require("../shared/middlewares/error.middleware");
const logger = require("../shared/utils/logger");

const app = express();

// CORS setup
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
  : process.env.NODE_ENV === "development"
  ? ["http://localhost:3000"]
  : ["https://your-production-domain.com"];
const corsOptions = {
  origin: corsOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Correlation-Id",
    "X-Platform",
  ],
};
app.use(cors(corsOptions));

// Security middleware
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      "style-src": ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      "connect-src": ["'self'", ...corsOrigins],
      "img-src": ["'self'", "data:"],
      "font-src": ["'self'", "https:", "data:"],
      "object-src": ["'none'"],
      "frame-src": ["'self'"],
      "worker-src": ["'self'"],
    },
  })
);

// Standard middleware
app.use(express.json());
app.use(cookieParser());
app.use(loggingMiddleware);

// ----------------- Updated Swagger Setup -------------------

// Correctly load the swagger.yaml YAML file here
const swaggerBase = YAML.load(path.join(__dirname, "../shared/swagger/swagger.yaml"));

const swaggerOptions = {
  definition: {
    ...swaggerBase,
    components: {
      ...swaggerBase.components,
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "JWT access token for authenticated requests. Include in the Authorization header as `Bearer <token>`. Tokens expire after 1 hour; refresh using /api/auth/refresh-token.",
        },
      },
    },
  },
  apis: [
    path.join(__dirname, "./routes/Auth/**/*.routes.js"),
    path.join(__dirname, "./routes/leads/**/*.routes.js"),
    path.join(__dirname, "./routes/tenants/**/*.routes.js"),
    // Removed 'components.js' from here because it is JS, not part of JSDoc annotations or YAML
  ],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: ".swagger-ui .topbar { background-color: #1a73e8 }",
  })
);
// -------------------------------------------------------------

// Routes
const authRoutes = require("../modules/auth/routes/Auth");
const leadsRoutes = require("./routes/leads");
const tenantsRoutes = require("./routes/tenants");

// Validate route exports
if (typeof authRoutes !== "function") {
  logger.error("Invalid route export in ./routes/Auth");
  throw new Error("Auth routes must export an Express router");
}
if (typeof leadsRoutes !== "function") {
  logger.error("Invalid route export in ./routes/leads");
  throw new Error("Leads routes must export an Express router");
}
if (typeof tenantsRoutes !== "function") {
  logger.error("Invalid route export in ./routes/tenants");
  throw new Error("Tenants routes must export an Express router");
}

app.use("/api/auth", authRoutes);
app.use("/api/leads", leadsRoutes);
app.use("/api/tenants", tenantsRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;
