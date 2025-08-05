const createError = require("http-errors");
const logger = require("../../../utils/logger");
const {
  listLeadScores,
} = require("../../../services/leads/leadScores.services");

const listLeadScoresController = async (req, res, next) => {
  try {
    const { tenantId } = req.query;
    const result = await listLeadScores(tenantId, req.user);
    logger.info("Lead scores retrieved successfully", {
      correlationId: req.correlationId,
      count: result.data.length,
    });
    res.status(200).json(result);
  } catch (err) {
    logger.error("Lead scores retrieval failed", {
      correlationId: req.correlationId,
      errorMessage: err.message,
    });
    next(createError(err.status || 400, err.message));
  }
};

module.exports = {
  listLeadScoresController,
};
