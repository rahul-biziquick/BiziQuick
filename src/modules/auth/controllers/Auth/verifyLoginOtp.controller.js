const createError = require("http-errors");
const logger = require("../../../../shared/utils/logger");
const {
  verifyLoginOTPServices,
} = require("../../services/Auth/verifyLoginOTP.services");

const verifyLoginOTPController = async (req, res, next) => {
  try {
    const { email, otp, platform } = req.body;
    const result = await verifyLoginOTPServices(
      email,
      otp,
      platform.toUpperCase()
    );
    logger.info("OTP verified and tokens issued", {
      correlationId: req.correlationId,
      email,
      platform,
    });
    res.status(200).json(result);
  } catch (err) {
    logger.error("OTP verification failed", {
      correlationId: req.correlationId,
      errorMessage: err.message,
    });
    next(createError(400, err.message));
  }
};

module.exports = {
  verifyLoginOTPController,
};
