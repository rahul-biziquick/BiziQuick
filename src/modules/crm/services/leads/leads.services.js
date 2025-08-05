const { PrismaClient } = require("@prisma/client");
const createError = require("http-errors");
const logger = require("../../utils/logger");
const csv = require("csv-parse");
const fs = require("fs");
const { Parser } = require("json2csv");
const {
  getPaginationParams,
  getPaginatedResponse,
} = require("../../utils/pagination");

const prisma = new PrismaClient();

const createLead = async (data, user) => {
  const {
    name,
    email,
    phone,
    source,
    company,
    status,
    tags,
    assignedTo,
    description,
    campaignId,
    tenantId,
  } = data;

  // Validate required fields
  if (!tenantId) {
    logger.warn("Missing tenant ID", { userId: user.id });
    throw createError(400, "Tenant ID is required");
  }

  // Validate tenant
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) {
    logger.warn("Invalid tenant ID", { userId: user.id, tenantId });
    throw createError(400, "Invalid tenant ID");
  }

  // Authorization check
  if (
    user.tenantId &&
    user.tenantId !== tenantId &&
    user.userrole !== "SUPER_ADMIN"
  ) {
    logger.warn("Unauthorized tenant access", { userId: user.id, tenantId });
    throw createError(403, "Unauthorized tenant access");
  }

  // Duplicate checks
  if (email) {
    const existingLead = await prisma.lead.findUnique({ where: { email } });
    if (existingLead)
      throw createError(400, "Lead with this email already exists");
  }
  if (phone) {
    const existingLead = await prisma.lead.findFirst({ where: { phone } });
    if (existingLead)
      throw createError(400, "Lead with this phone already exists");
  }

  // Company autofill
  let derivedCompany = company;
  if (!company && email) {
    const domain = email.split("@")[1];
    derivedCompany = domain ? domain.split(".")[0] : null;
  }

  // Calculate lead score
  const sourceWeights = { website: 20, email: 15, social: 10, manual: 5 };
  const engagementActivity = data.activities?.length || 0;
  const score = Math.round(
    (sourceWeights[source?.toLowerCase()] || 0) + engagementActivity
  );

  // Round-robin assignment
  let assignedToId = assignedTo;
  if (!assignedTo) {
    const salesUsers = await prisma.user.findMany({
      where: {
        userrole: { in: ["SALES_EXECUTIVE", "MANAGER"] },
        tenantId,
      },
    });

    if (salesUsers.length === 0) {
      logger.warn("No sales users available for assignment", { tenantId });
      throw createError(400, "No sales users available for assignment");
    }

    const lastAssignedLead = await prisma.lead.findFirst({
      where: { tenantId, archived: false },
      orderBy: { createdAt: "desc" },
    });

    const lastAssignedIndex = lastAssignedLead?.assignedToId
      ? salesUsers.findIndex((u) => u.id === lastAssignedLead.assignedToId)
      : -1;

    const nextIndex = (lastAssignedIndex + 1) % salesUsers.length;
    assignedToId = salesUsers[nextIndex]?.id;
  }

  // Validate assigned user
  if (assignedToId) {
    const assignedUser = await prisma.user.findUnique({
      where: { id: assignedToId },
    });
    if (
      !assignedUser ||
      (assignedUser.tenantId && assignedUser.tenantId !== tenantId)
    ) {
      logger.warn("Invalid assigned user", { assignedToId, tenantId });
      throw createError(400, "Invalid assigned user");
    }
  }

  const lead = await prisma.lead.create({
    data: {
      name,
      email,
      phone,
      source,
      company: derivedCompany,
      status: status || "New",
      tags: campaignId
        ? [...(tags || []), `campaign-${campaignId}`]
        : tags || [],
      description,
      score,
      tenantId,
      ownerId: user.id,
      assignedToId,
      activities: [{ type: "created", userId: user.id, timestamp: new Date() }],
      notes: data.notes || [],
      attachments: data.attachments || [],
    },
  });

  logger.info("Lead created", { leadId: lead.id, tenantId, userId: user.id });
  return { message: "Lead created successfully", lead };
};

const listLeads = async (params, user) => {
  const { status, source, ownerId, search, tenantId, createdDate, score } =
    params;

  // Use getPaginationParams
  const { skip, take, currentPage, pageSize } = getPaginationParams(
    params.page,
    params.limit
  );

  // Validate tenant
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) throw createError(400, "Invalid tenant ID");

  // Authorization check
  if (
    user.tenantId &&
    user.tenantId !== tenantId &&
    user.userrole !== "ADMIN"
  ) {
    throw createError(403, "Unauthorized tenant access");
  }

  // Build where clause
  const where = { tenantId, archived: false };
  if (status) where.status = status;
  if (source) where.source = source;
  if (ownerId) where.ownerId = Number(ownerId);
  if (score) where.score = Number(score);
  if (createdDate) {
    const date = new Date(createdDate);
    where.createdAt = {
      gte: date,
      lte: new Date(date.setDate(date.getDate() + 1)),
    };
  } else {
    where.createdAt = { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
  }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { company: { contains: search, mode: "insensitive" } },
    ];
  }

  // Fetch leads and total count
  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      skip,
      take,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        source: true,
        company: true,
        status: true,
        tags: true,
        score: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.lead.count({ where }),
  ]);

  // Use getPaginatedResponse and adapt to existing structure
  const paginatedResponse = getPaginatedResponse(
    leads,
    total,
    currentPage,
    pageSize
  );
  return {
    data: paginatedResponse.items,
    pagination: {
      page: paginatedResponse.currentPage,
      limit: paginatedResponse.pageSize,
      total: paginatedResponse.totalItems,
      total_pages: paginatedResponse.totalPages,
    },
  };
};

const getLead = async (id, tenantId, user) => {
  // Validate user
  if (!user) {
    logger.warn("No user provided", { tenantId });
    throw createError(401, "Unauthorized: No user authenticated");
  }

  // Validate tenant
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) {
    logger.warn("Invalid tenant ID", { userId: user.id, tenantId });
    throw createError(400, "Invalid tenant ID");
  }

  // Authorization check
  if (
    user.tenantId &&
    user.tenantId !== tenantId &&
    user.userrole !== "ADMIN"
  ) {
    logger.warn("Unauthorized tenant access", { userId: user.id, tenantId });
    throw createError(403, "Unauthorized tenant access");
  }

  // Validate and parse lead ID
  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId) || parsedId <= 0) {
    logger.warn("Invalid lead ID", { leadId: id, tenantId });
    throw createError(400, "Invalid lead ID");
  }

  const lead = await prisma.lead.findFirst({
    where: { id: parsedId, tenantId, archived: false },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      assignedTo: { select: { id: true, name: true, email: true } },
    },
  });

  if (!lead) {
    logger.warn("Lead not found", { leadId: parsedId, tenantId });
    throw createError(404, "Lead not found");
  }

  logger.info("Lead retrieved", {
    leadId: parsedId,
    tenantId,
    userId: user.id,
  });
  return lead;
};

const updateLead = async (id, data, tenantId, user) => {
  // Validate user
  if (!user) {
    logger.warn("No user provided", { tenantId });
    throw createError(401, "Unauthorized: No user authenticated");
  }

  // Validate tenant
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) {
    logger.warn("Invalid tenant ID", { userId: user.id, tenantId });
    throw createError(400, "Invalid tenant ID");
  }

  // Authorization check
  if (
    user.tenantId &&
    user.tenantId !== tenantId &&
    user.userrole !== "ADMIN"
  ) {
    logger.warn("Unauthorized tenant access", { userId: user.id, tenantId });
    throw createError(403, "Unauthorized tenant access");
  }

  // Validate leadId
  const leadId = parseInt(id, 10);
  if (isNaN(leadId) || leadId <= 0) {
    logger.warn("Invalid lead ID", { leadId: id, tenantId });
    throw createError(400, "Invalid lead ID");
  }

  // Fetch lead
  const lead = await prisma.lead.findFirst({
    where: { id: leadId, tenantId, archived: false },
  });

  if (!lead) {
    logger.warn("Lead not found", { leadId, tenantId });
    throw createError(404, "Lead not found");
  }

  // Duplicate checks for updated email/phone
  if (data.email && data.email !== lead.email) {
    const existingLead = await prisma.lead.findUnique({
      where: { email: data.email },
    });
    if (existingLead) {
      throw createError(400, "Lead with this email already exists");
    }
  }
  if (data.phone && data.phone !== lead.phone) {
    const existingLead = await prisma.lead.findFirst({
      where: { phone: data.phone },
    });
    if (existingLead) {
      throw createError(400, "Lead with this phone already exists");
    }
  }

  // Company autofill for updated email
  let derivedCompany = data.company;
  if (!data.company && data.email) {
    const domain = data.email.split("@")[1];
    derivedCompany = domain ? domain.split(".")[0] : null;
  }

  // Validate assigned user
  if (data.assignedTo) {
    const assignedUser = await prisma.user.findUnique({
      where: { id: data.assignedTo },
    });
    if (
      !assignedUser ||
      (assignedUser.tenantId && assignedUser.tenantId !== tenantId)
    ) {
      logger.warn("Invalid assigned user", {
        assignedTo: data.assignedTo,
        tenantId,
      });
      throw createError(400, "Invalid assigned user");
    }
  }

  // Merge activities and notes
  const updatedActivities = data.activities
    ? [
        ...lead.activities,
        ...data.activities.map((activity) => ({
          ...activity,
          timestamp: new Date(),
          userId: user.id,
        })),
      ]
    : lead.activities;
  const updatedNotes = data.notes
    ? [
        ...lead.notes,
        ...data.notes.map((note) => ({
          ...note,
          timestamp: new Date(),
          userId: user.id,
        })),
      ]
    : lead.notes;

  const updatedLead = await prisma.lead.update({
    where: { id: leadId },
    data: {
      name: data.name || lead.name,
      email: data.email || lead.email,
      phone: data.phone || lead.phone,
      source: data.source || lead.source,
      company: derivedCompany || lead.company,
      status: data.status || lead.status,
      tags: data.tags || lead.tags,
      description: data.description || lead.description,
      assignedToId: data.assignedTo || lead.assignedToId,
      activities: updatedActivities,
      notes: updatedNotes,
      attachments: data.attachments
        ? [...lead.attachments, ...data.attachments]
        : lead.attachments,
    },
  });

  logger.info("Lead updated", { leadId, tenantId, userId: user.id });
  return { message: "Lead updated successfully", lead: updatedLead };
};

const archiveLead = async (id, tenantId, user) => {
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

  const leadId = parseInt(id);
  if (isNaN(leadId)) {
    logger.warn("Invalid lead ID", { leadId: id, tenantId });
    throw createError(400, "Invalid lead ID");
  }

  const lead = await prisma.lead.findFirst({
    where: { id: leadId, tenantId, archived: false },
  });

  if (!lead) {
    logger.warn("Lead not found", { leadId, tenantId });
    throw createError(404, "Lead not found");
  }

  await prisma.lead.update({
    where: { id: leadId },
    data: { archived: true },
  });

  logger.info("Lead archived", { leadId, tenantId, userId: user.id });
  return { message: "Lead archived successfully" };
};

const bulkActionLeads = async (action, leadIds, data, tenantId, user) => {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) throw createError(400, "Invalid tenant ID");

  if (
    user.tenantId &&
    user.tenantId !== tenantId &&
    user.userrole !== "ADMIN"
  ) {
    throw createError(403, "Unauthorized tenant access");
  }

  const leads = await prisma.lead.findMany({
    where: { id: { in: leadIds.map(Number) }, tenantId, archived: false },
  });

  if (leads.length !== leadIds.length) {
    throw createError(404, "One or more leads not found");
  }

  switch (action) {
    case "assign":
      if (!data.assignedTo) throw createError(400, "Assigned user ID required");
      const assignedUser = await prisma.user.findUnique({
        where: { id: data.assignedTo },
      });
      if (
        !assignedUser ||
        (assignedUser.tenantId && assignedUser.tenantId !== tenantId)
      ) {
        throw createError(400, "Invalid assigned user");
      }
      await prisma.lead.updateMany({
        where: { id: { in: leadIds.map(Number) } },
        data: { assignedToId: data.assignedTo },
      });
      break;
    case "delete":
      await prisma.lead.updateMany({
        where: { id: { in: leadIds.map(Number) } },
        data: { archived: true },
      });
      break;
    case "tag":
      if (!data.tags || !Array.isArray(data.tags))
        throw createError(400, "Tags array required");
      await prisma.lead.updateMany({
        where: { id: { in: leadIds.map(Number) } },
        data: { tags: { push: data.tags } },
      });
      break;
    default:
      throw createError(400, "Invalid bulk action");
  }

  logger.info(`Bulk ${action} performed on leads`, {
    leadIds,
    tenantId,
    userId: user.id,
  });
  return { message: `Bulk ${action} completed successfully` };
};

const importLeads = async (file, tenantId, user) => {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) throw createError(400, "Invalid tenant ID");

  if (
    user.tenantId &&
    user.tenantId !== tenantId &&
    user.userrole !== "ADMIN"
  ) {
    throw createError(403, "Unauthorized tenant access");
  }

  const results = [];
  const errors = [];
  const parser = csv.parse({ columns: true, trim: true });

  fs.createReadStream(file.path)
    .pipe(parser)
    .on("data", async (row) => {
      try {
        if (!row.name || !row.email) {
          errors.push({
            row,
            error: "Missing mandatory fields (name or email)",
          });
          return;
        }

        const existingLead = await prisma.lead.findFirst({
          where: { OR: [{ email: row.email }, { phone: row.phone }], tenantId },
        });
        if (existingLead) {
          errors.push({ row, error: "Duplicate email or phone" });
          return;
        }

        const sourceWeights = { website: 20, email: 15, social: 10, manual: 5 };
        const score = sourceWeights[row.source?.toLowerCase()] || 0;

        await prisma.lead.create({
          data: {
            name: row.name,
            email: row.email,
            phone: row.phone || null,
            source: row.source || "manual",
            company: row.email ? row.email.split("@")[1]?.split(".")[0] : null,
            status: row.status || "New",
            tags: row.tags ? row.tags.split(",") : [],
            score,
            tenantId,
            ownerId: user.id,
          },
        });
        results.push(row);
      } catch (err) {
        errors.push({ row, error: err.message });
      }
    })
    .on("end", () => {
      logger.info("Lead import completed", {
        tenantId,
        userId: user.id,
        imported: results.length,
        errors: errors.length,
      });
    })
    .on("error", (err) => {
      logger.error("Lead import failed", {
        tenantId,
        userId: user.id,
        error: err.message,
      });
      throw createError(500, "Lead import failed");
    });

  return { message: "Lead import processed", results, errors };
};

const exportLeads = async (params, user) => {
  const { tenantId } = params;
  const leads = await listLeads(params, user);
  const fields = [
    "id",
    "name",
    "email",
    "phone",
    "source",
    "company",
    "status",
    "tags",
    "score",
    "createdAt",
  ];
  const json2csvParser = new Parser({ fields });
  const csv = json2csvParser.parse(leads.data);

  logger.info("Leads exported to CSV", { tenantId, userId: user.id });
  return csv;
};

module.exports = {
  createLead,
  listLeads,
  getLead,
  updateLead,
  archiveLead,
  bulkActionLeads,
  importLeads,
  exportLeads,
};
