const createError = require("http-errors");
const logger = require("../../../../shared/utils/logger");
const { createLead } = require("../../services/leads/leads.services");

const createLeadController = async (req, res, next) => {
  try {
    const result = await createLead(req.body, req.user);
    logger.info("Lead created successfully", {
      correlationId: req.correlationId,
      leadId: result.lead.id,
    });
    res.status(201).json(result);
  } catch (err) {
    logger.error("Lead creation failed", {
      correlationId: req.correlationId,
      errorMessage: err.message,
    });
    next(createError(err.status || 400, err.message));
  }
};

module.exports = {
  createLeadController,
};
