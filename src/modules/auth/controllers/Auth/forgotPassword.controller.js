const createError = require("http-errors");
const logger = require("../../utils/logger");
const {
  forgotPasswordServices,
} = require("../../services/Auth/forgotPassword.Services");

const forgotPasswordController = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await forgotPasswordServices(email);
    logger.info("Password reset OTP sent", {
      correlationId: req.correlationId,
      email,
    });
    res.status(200).json(result);
  } catch (err) {
    logger.error("Forgot password failed", {
      correlationId: req.correlationId,
      errorMessage: err.message,
    });
    next(createError(400, err.message));
  }
};

module.exports = {
  forgotPasswordController,
};
