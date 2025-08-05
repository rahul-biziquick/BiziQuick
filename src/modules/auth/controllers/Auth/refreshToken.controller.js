const createError = require("http-errors");
const logger = require("../../utils/logger");
const {
  refreshTokenServices,
} = require("../../services/Auth/refreshToken.services");

const refreshTokenController = async (req, res, next) => {
  try {
    const { refreshToken, platform } = req.body;
    const token =
      refreshToken || req.cookies[`${platform.toLowerCase()}RefreshToken`];
    if (!token) {
      throw createError(400, "Refresh token is required");
    }
    const result = await refreshTokenServices(token, platform.toUpperCase());
    logger.info("Token refreshed", {
      correlationId: req.correlationId,
      platform,
    });
    res.status(200).json(result);
  } catch (err) {
    logger.error("Token refresh failed", {
      correlationId: req.correlationId,
      errorMessage: err.message,
    });
    next(createError(403, err.message));
  }
};

module.exports = {
  refreshTokenController,
};
