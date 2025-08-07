const prisma = require("../../../../shared/config/prismaClient");
const {
  generateAccessToken,
  verifyRefreshToken,
} = require("../../../../shared/utils/jwt.util");
const logger = require("../../../../shared/utils/logger");
const createError = require("http-errors");

const refreshTokenServices = async (refreshToken, platform) => {
  if (!["WEB", "MOBILE"].includes(platform)) {
    logger.warn("Invalid platform during token refresh", { platform });
    throw createError(400, "Invalid platform");
  }

  try {
    const payload = verifyRefreshToken(refreshToken);
    const whereClause =
      platform === "WEB"
        ? { webRefreshToken: refreshToken }
        : { mobileRefreshToken: refreshToken };

    const user = await prisma.user.findFirst({ where: whereClause });

    if (
      !user ||
      user.id !== payload.id ||
      user.userrole !== payload.role ||
      platform !== payload.platform
    ) {
      logger.warn("Invalid refresh token", { platform });
      throw createError(403, "Invalid refresh token");
    }

    const refreshTokenExpiresAt =
      platform === "WEB"
        ? user.webRefreshTokenExpiresAt
        : user.mobileRefreshTokenExpiresAt;
    const currentSessionVersion =
      platform === "WEB" ? user.webSessionVersion : user.mobileSessionVersion;

    if (!refreshTokenExpiresAt || new Date() > refreshTokenExpiresAt) {
      logger.warn("Refresh token expired", { platform });
      throw createError(403, "Refresh token expired");
    }

    if (payload.sessionVersion !== currentSessionVersion) {
      logger.warn("Refresh token invalidated due to new session", { platform });
      throw createError(403, "Refresh token invalidated due to new session");
    }

    const newAccessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.userrole,
      platform,
      sessionVersion: currentSessionVersion,
    });

    logger.info("Access token refreshed", { platform, userId: user.id });
    return { accessToken: newAccessToken };
  } catch (err) {
    logger.error("Token refresh failed", {
      errorMessage: err.message,
      platform,
    });
    throw createError(403, "Refresh token expired or invalid");
  }
};

module.exports = {
  refreshTokenServices,
};
