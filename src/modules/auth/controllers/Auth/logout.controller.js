const createError = require("http-errors");
const logger = require("../../../../shared/utils/logger");
const { logoutServices } = require("../../services/Auth/logout.services");

/**
 * Controller to handle user logout
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */

const logoutController = async (req, res, next) => {
  try {
    const { email, platform } = req.body;
    await logoutServices(email, platform.toUpperCase());
    res.clearCookie(`${platform.toLowerCase()}RefreshToken`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      path: "/",
    });
    logger.info("User logged out", {
      correlationId: req.correlationId,
      email,
      platform,
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    logger.error("Logout failed", {
      correlationId: req.correlationId,
      errorMessage: err.message,
    });
    next(createError(500, err.message));
  }
};

module.exports = {
  logoutController,
};
