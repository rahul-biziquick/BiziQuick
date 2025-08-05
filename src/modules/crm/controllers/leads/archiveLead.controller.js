const createError = require("http-errors");
const logger = require("../../utils/logger");
const { archiveLead } = require("../../services/leads/leads.services");

const archiveLeadController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.query;
    await archiveLead(id, tenantId, req.user);
    logger.info("Lead archived successfully", {
      correlationId: req.correlationId,
      leadId: id,
    });
    res.status(204).send();
  } catch (err) {
    logger.error("Lead archival failed", {
      correlationId: req.correlationId,
      errorMessage: err.message,
    });
    next(createError(err.status || 400, err.message));
  }
};

module.exports = {
  archiveLeadController,
};
