const prisma = require("../../../../shared/config/prismaClient");
const createError = require("http-errors");
const logger = require("../../../../shared/utils/logger");

const listLeadScores = async (tenantId, user) => {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) {
    logger.warn("Invalid tenant ID", { userId: user.id, tenantId });
    throw createError(400, "Invalid tenant ID");
  }

  if (
    user.tenantId &&
    user.tenantId !== tenantId &&
    user.userrole !== "ADMIN"
  ) {
    logger.warn("Unauthorized tenant access", { userId: user.id, tenantId });
    throw createError(403, "Unauthorized tenant access");
  }

  const leadScores = await prisma.leadScore.findMany({
    where: { tenantId },
    select: {
      id: true,
      event: true,
      points: true,
      condition: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  logger.info("Lead scores retrieved", {
    tenantId,
    userId: user.id,
    count: leadScores.length,
  });
  return { data: leadScores };
};

const createOrUpdateLeadScore = async (data, tenantId, user) => {
  const { event, points, condition, leadId } = data;

  // Validate tenant
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) {
    logger.warn("Invalid tenant ID", { userId: user.id, tenantId });
    throw createError(400, "Invalid tenant ID");
  }

  // Validate leadId using findFirst (because we need to check id + tenantId)
  const lead = await prisma.lead.findFirst({
    where: { id: leadId, tenantId },
  });

  if (!lead) {
    logger.warn("Invalid lead ID", { userId: user.id, leadId, tenantId });
    throw createError(400, "Invalid lead ID");
  }

  // Create new lead score record
  const leadScore = await prisma.leadScore.create({
    data: {
      event,
      points,
      condition,
      tenantId,
      leadId,
    },
  });

  // Update lead's score
  const updatedLead = await prisma.lead.update({
    where: { id: leadId },
    data: { score: { increment: points } },
  });

  logger.info("Lead score created and lead updated", {
    leadScoreId: leadScore.id,
    tenantId,
    userId: user.id,
    leadId,
  });

  return {
    message: "Lead score created successfully",
    leadScore,
    lead: { id: leadId, score: updatedLead.score },
  };
};

module.exports = {
  listLeadScores,
  createOrUpdateLeadScore,
};
