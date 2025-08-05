const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const prisma = require("../../config/prismaClient");
const { sendOTPEmail } = require("../../utils/email.util");
const logger = require("../../utils/logger");
const createError = require("http-errors");
const RESET_TOKEN_EXPIRY_MS = 15 * 60 * 1000;

const forgotPasswordServices = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    logger.warn("Forgot password attempt for non-existent user", { email });
    throw createError(404, "User not found");
  }

  const resetToken = uuidv4();
  const resetTokenExpiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);

  await prisma.user.update({
    where: { email },
    data: {
      resetPasswordToken: resetToken,
      resetPasswordExpiresAt: resetTokenExpiresAt,
    },
  });

  await sendOTPEmail(email, resetToken);

  logger.info("Password reset token sent", { email });
  return {
    message: "Password reset token sent to your email",
    resetToken,
  };
};

module.exports = {
  forgotPasswordServices,
};
