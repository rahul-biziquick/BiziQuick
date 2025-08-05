const createError = require("http-errors");
const logger = require("../../../utils/logger");
const {
  createOrUpdateLeadScore,
} = require("../../../services/leads/leadScores.services");

const createOrUpdateLeadScoreController = async (req, res, next) => {
  try {
    const { tenantId } = req.body;
    const result = await createOrUpdateLeadScore(req.body, tenantId, req.user);
    logger.info("Lead score processed successfully", {
      correlationId: req.correlationId,
      leadScoreId: result.leadScore.id,
    });
    res.status(201).json(result);
  } catch (err) {
    logger.error("Lead score processing failed", {
      correlationId: req.correlationId,
      errorMessage: err.message,
    });
    next(createError(err.status || 400, err.message));
  }
};

module.exports = {
  createOrUpdateLeadScoreController,
};
