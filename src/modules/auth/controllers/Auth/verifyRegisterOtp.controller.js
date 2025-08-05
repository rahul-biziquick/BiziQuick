const createError = require("http-errors");
const logger = require("../../../../shared/utils/logger");
const {
  verifyRegistrationOtpServices,
} = require("../../services/Auth/verifyRegistrationOtpServices");

const verifyRegisterOTPController = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const result = await verifyRegistrationOtpServices(email, otp);
    logger.info("Registration OTP verified", {
      correlationId: req.correlationId,
      email,
    });
    res.status(200).json(result);
  } catch (err) {
    logger.error("Registration OTP verification failed", {
      correlationId: req.correlationId,
      errorMessage: err.message,
    });
    next(createError(400, err.message));
  }
};

module.exports = {
  verifyRegisterOTPController,
};
