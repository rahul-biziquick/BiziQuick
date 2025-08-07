const bcrypt = require("bcrypt");
const prisma = require("../../../../shared/config/prismaClient");
const logger = require("../../../../shared/utils/logger");
const createError = require("http-errors");
const SALT_ROUNDS = 10;

const resetPasswordServices = async (token, newPassword) => {
  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: token,
      resetPasswordExpiresAt: { gt: new Date() },
    },
  });

  if (!user) {
    logger.warn("Invalid or expired password reset token");
    throw createError(400, "Invalid or expired reset token");
  }

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpiresAt: null,
    },
  });

  logger.info("Password reset successfully", { userId: user.id });
  return { message: "Password reset successfully" };
};

module.exports = {
  resetPasswordServices,
};
