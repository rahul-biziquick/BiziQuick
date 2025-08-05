const { v4: uuidv4 } = require("uuid");
const prisma = require("../../config/prismaClient");
const logger = require("../../utils/logger");
const createError = require("http-errors");

const logoutServices = async (email, platform) => {
  if (!["WEB", "MOBILE"].includes(platform)) {
    logger.warn("Invalid platform during logout", { platform });
    throw createError(400, "Invalid platform");
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    logger.warn("User not found during logout", { email });
    throw createError(404, "User not found");
  }

  const storedRefreshToken =
    platform === "WEB" ? user.webRefreshToken : user.mobileRefreshToken;
  if (!storedRefreshToken) {
    logger.warn("No active session found for logout", { email, platform });
    throw createError(400, "No active session found for this platform");
  }

  const updateData =
    platform === "WEB"
      ? {
          webRefreshToken: null,
          webSessionId: null,
          webRefreshTokenExpiresAt: null,
        }
      : {
          mobileRefreshToken: null,
          mobileSessionId: null,
          mobileRefreshTokenExpiresAt: null,
        };

  await prisma.user.update({
    where: { email },
    data: updateData,
  });

  logger.info("User logged out successfully", { email, platform });
};

module.exports = {
  logoutServices,
};
