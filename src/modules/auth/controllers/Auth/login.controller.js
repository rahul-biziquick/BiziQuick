const createError = require("http-errors");
const logger = require("../../../../shared/utils/logger");
const { loginServices } = require("../../services/Auth/login.service");

const loginController = async (req, res, next) => {
  try {
    const { email, password, platform } = req.body;
    const result = await loginServices(email, password, platform.toUpperCase());
    logger.info("Login OTP sent", {
      correlationId: req.correlationId,
      email,
      platform,
    });
    res.status(200).json(result);
  } catch (err) {
    logger.error("Login failed", {
      correlationId: req.correlationId,
      errorMessage: err.message,
    });
    next(createError(401, err.message));
  }
};

module.exports = {
  loginController,
};
