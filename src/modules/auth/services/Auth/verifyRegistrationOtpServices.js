const prisma = require("../../../../modules/auth/");
const { verifyOTP } = require("../../utils/otp.util");
const logger = require("../../utils/logger");
const createError = require("http-errors");

const verifyRegistrationOtpServices = async (email, otp) => {
  const isValid = verifyOTP(email, otp);
  if (!isValid) {
    logger.warn("Invalid or expired registration OTP", { email });
    throw createError(400, "Invalid or expired OTP");
  }
  const user = await prisma.user.update({
    where: { email },
    data: { isVerified: true, isOtpEnabled: true },
  });

  logger.info("Registration OTP verified", { userId: user.id, email });
  return { message: "Email verified successfully", userId: user.id };
};

module.exports = {
  verifyRegistrationOtpServices,
};
