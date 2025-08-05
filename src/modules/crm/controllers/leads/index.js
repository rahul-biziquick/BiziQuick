const { createLeadController } = require("./createLead.controller");
const { listLeadsController } = require("./listLeads.controller");
const { getLeadController } = require("./getLead.controller");
const { updateLeadController } = require("./updateLead.controller");
const { archiveLeadController } = require("./archiveLead.controller");
const {
  createOrUpdateLeadScoreController,
  listLeadScoresController,
} = require("./leadScores");

module.exports = {
  createLeadController,
  listLeadsController,
  getLeadController,
  updateLeadController,
  archiveLeadController,
  createOrUpdateLeadScoreController,
  listLeadScoresController,
};
