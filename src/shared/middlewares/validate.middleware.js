const createError = require("http-errors");
const logger = require("../utils/logger");

const validate =
  ({ body, query, params }) =>
  async (req, res, next) => {
    try {
      // Validate and overwrite if schema is provided
      if (body) {
        const value = await body.validateAsync(req.body, {
          abortEarly: false,
          convert: true,
        });
        req.body = value;
      }

      if (query) {
        const value = await query.validateAsync(req.query, {
          abortEarly: false,
          convert: true,
        });
        req.query = value;
      }

      if (params) {
        const value = await params.validateAsync(req.params, {
          abortEarly: false,
          convert: true,
        });
        req.params = value;
      }

      next();
    } catch (err) {
      logger.warn("Validation failed", {
        correlationId: req.correlationId,
        errors: err.details,
      });
      next(createError(400, err));
    }
  };
console.log("Validation middleware loaded");
module.exports = { validate };
