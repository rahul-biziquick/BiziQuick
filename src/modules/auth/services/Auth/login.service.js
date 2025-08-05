const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const prisma = require("../../../../shared/config/prismaClient");
const { generateOTP, storeOTP } = require("../../../../shared/utils/otp.util");
const { sendOTPEmail } = require("../../../../shared/utils/email.util");
const logger = require("../../../../shared/utils/logger");
const createError = require("http-errors");
const allowedPlatforms = require("../../../../shared/constants/platforms");

const loginServices = async (email, password, platform) => {
  if (!allowedPlatforms.includes(platform)) {
    logger.warn("Invalid platform provided", { platform });
    throw createError(400, "Invalid platform");
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    logger.warn("Invalid login credentials", { email });
    throw createError(401, "Invalid credentials");
  }

  if (!user.isVerified) {
    logger.warn("Unverified email login attempt", { email });
    throw createError(401, "Please verify your email first.");
  }

  const pendingToken = uuidv4();

  await prisma.user.update({
    where: { email },
    data: {
      pendingLoginToken: pendingToken,
      pendingLoginPlatform: platform,
      lastLoginAt: new Date(),
    },
  });

  const otp = generateOTP();
  await storeOTP(email, otp); // Should be Redis-based for expiry + overwriting
  await sendOTPEmail(email, otp);

  logger.info("Login OTP sent", { email, platform });

  return process.env.NODE_ENV === "development"
    ? { message: "OTP sent to your email", pendingToken, platform, otp }
    : { message: "OTP sent to your email", pendingToken, platform };
};

module.exports = {
  loginServices,
};
