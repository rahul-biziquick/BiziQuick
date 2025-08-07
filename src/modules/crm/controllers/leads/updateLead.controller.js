const createError = require("http-errors");
const logger = require("../../../../shared/utils/logger");
const { updateLead } = require("../../services/leads/leads.services");

const updateLeadController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.body;

    // Validate id
    if (!id) {
      logger.warn("Missing lead ID in request", {
        correlationId: req.correlationId,
      });
      throw createError(400, '"id" is required');
    }

    // Validate tenantId
    if (!tenantId) {
      logger.warn("Missing tenant ID in request", {
        correlationId: req.correlationId,
      });
      throw createError(400, '"tenantId" is required');
    }

    // Validate user
    if (!req.user) {
      logger.warn("Unauthorized request: No user provided", {
        correlationId: req.correlationId,
      });
      throw createError(401, "Unauthorized: No user authenticated");
    }

    const result = await updateLead(id, req.body, tenantId, req.user);
    logger.info("Lead updated successfully", {
      correlationId: req.correlationId,
      leadId: id,
    });
    res.status(200).json(result);
  } catch (err) {
    logger.error("Lead update failed", {
      correlationId: req.correlationId,
      errorMessage: err.message,
    });
    next(createError(err.status || 400, err.message));
  }
};

module.exports = {
  updateLeadController,
};
