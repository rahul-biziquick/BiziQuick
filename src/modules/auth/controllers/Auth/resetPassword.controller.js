const createError = require("http-errors");
const logger = require("../../../../shared/utils/logger");
const {
  resetPasswordServices,
} = require("../../services/Auth/resetPassword.services");

const resetPasswordController = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    const result = await resetPasswordServices(token, newPassword);
    logger.info("Password reset successfully", {
      correlationId: req.correlationId,
    });
    res.status(200).json(result);
  } catch (err) {
    logger.error("Password reset failed", {
      correlationId: req.correlationId,
      errorMessage: err.message,
    });
    next(createError(400, err.message));
  }
};

module.exports = {
  resetPasswordController,
};
