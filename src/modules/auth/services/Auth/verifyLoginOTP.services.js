const { v4: uuidv4 } = require("uuid");
const prisma = require("../../../../shared/config/prismaClient");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../../../shared/utils/jwt.util");
const { verifyOTP } = require("../../../../shared/utils/otp.util");
const logger = require("../../../../shared/utils/logger");
const createError = require("http-errors");

const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

const verifyLoginOTPServices = async (email, otp, platform) => {
  const isValid = verifyOTP(email, otp);
  if (!isValid) {
    logger.warn("Invalid or expired login OTP", { email, platform });
    throw createError(400, "Invalid or expired OTP");
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    logger.warn("User not found during OTP verification", { email });
    throw createError(404, "User not found");
  }

  if (!["WEB", "MOBILE"].includes(platform)) {
    logger.warn("Invalid platform during OTP verification", { platform });
    throw createError(400, "Invalid platform");
  }

  if (!user.pendingLoginToken || user.pendingLoginPlatform !== platform) {
    logger.warn("No pending login session or invalid platform", {
      email,
      platform,
    });
    throw createError(
      400,
      "No pending login session found or invalid platform"
    );
  }

  const sessionVersion =
    (platform === "WEB" ? user.webSessionVersion : user.mobileSessionVersion) +
    1;

  const sessionId = uuidv4();
  const refreshTokenExpiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);

  const accessToken = generateAccessToken({
    id: user.id,
    email: user.email,
    role: user.userrole,
    platform,
    sessionVersion,
  });

  const refreshToken = generateRefreshToken({
    id: user.id,
    email: user.email,
    role: user.userrole,
    platform,
    sessionVersion,
  });

  const updateData =
    platform === "WEB"
      ? {
          webRefreshToken: refreshToken,
          webSessionId: sessionId,
          webRefreshTokenExpiresAt: refreshTokenExpiresAt,
          webSessionVersion: sessionVersion,
          pendingLoginToken: null,
          pendingLoginPlatform: null,
        }
      : {
          mobileRefreshToken: refreshToken,
          mobileSessionId: sessionId,
          mobileRefreshTokenExpiresAt: refreshTokenExpiresAt,
          mobileSessionVersion: sessionVersion,
          pendingLoginToken: null,
          pendingLoginPlatform: null,
        };

  await prisma.user.update({
    where: { email },
    data: updateData,
  });

  logger.info("Login successful, tokens issued", {
    email,
    platform,
    sessionId,
  });

  return {
    accessToken,
    refreshToken,
    message: "Login successful",
  };
};

module.exports = {
  verifyLoginOTPServices,
};
