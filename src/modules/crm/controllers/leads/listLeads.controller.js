const createError = require("http-errors");
const logger = require("../../../../shared/utils/logger");
const { listLeads } = require("../../services/leads/leads.services");

const listLeadsController = async (req, res, next) => {
  try {
    const params = { ...req.query, tenantId: req.query.tenantId };
    const result = await listLeads(params, req.user);
    logger.info("Leads retrieved successfully", {
      correlationId: req.correlationId,
      count: result.data.length,
    });
    res.status(200).json(result);
  } catch (err) {
    logger.error("Lead listing failed", {
      correlationId: req.correlationId,
      errorMessage: err.message,
    });
    next(createError(err.status || 400, err.message));
  }
};

module.exports = {
  listLeadsController,
};
