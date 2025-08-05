const createError = require("http-errors");
const logger = require("../../../../shared/utils/logger");
const { registerServices } = require("../../services/Auth/register.services");

const registerController = async (req, res, next) => {
  try {
    const { name, email, password, userrole, tenantId } = req.body;
    const result = await registerServices(
      name,
      email,
      password,
      userrole,
      tenantId
    );
    logger.info("User registered successfully", {
      correlationId: req.correlationId,
      email,
      userrole,
      tenantId,
    });
    res.status(201).json(result);
  } catch (err) {
    logger.error("Registration failed", {
      correlationId: req.correlationId,
      errorMessage: err.message,
    });
    if (err.message === "User already exists") {
      next(createError(409, "Email already registered"));
    } else {
      next(createError(400, err.message));
    }
  }
};

module.exports = { registerController };
