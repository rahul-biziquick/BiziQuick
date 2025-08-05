const bcrypt = require("bcrypt");
const prisma = require("../../../../shared/config/prismaClient");
const { generateOTP, storeOTP } = require("../../../../shared/utils/otp.util");
const { sendOTPEmail } = require("../../../../shared/utils/email.util");
const logger = require("../../../../shared/utils/logger");
const createError = require("http-errors");
const { getUserTimeZone } = require("../../../../shared/utils/dateUtils"); // Import dateUtils
const SALT_ROUNDS = 10;
const allowedRoles = require("../../../../shared/constants/roles");

const registerServices = async (
  name,
  email,
  password,
  userrole,
  tenantId,
  timeZone
) => {
  if (!allowedRoles.includes(userrole)) {
    throw createError(400, `Invalid role. Allowed: ${allowedRoles.join(", ")}`);
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw createError(409, "User already exists");

  if (tenantId) {
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw createError(400, "Invalid tenant ID");
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const userTimeZone = getUserTimeZone(timeZone); // fallback logic inside this function

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      isVerified: false,
      userrole,
      timeZone: userTimeZone,
      tenant: {
        connect: { id: tenantId || "default" },
      },
    },
  });

  const otp = generateOTP();
  await storeOTP(email, otp);
  await sendOTPEmail(email, otp);

  logger.info("OTP generated for registration", {
    userId: newUser.id,
    email,
    userrole,
    tenantId,
    timeZone: userTimeZone,
  });

  return process.env.NODE_ENV === "development"
    ? {
        message: "OTP sent to your email. Please verify.",
        userId: newUser.id,
        otp,
      }
    : { message: "OTP sent to your email. Please verify.", userId: newUser.id };
};

module.exports = { registerServices };
