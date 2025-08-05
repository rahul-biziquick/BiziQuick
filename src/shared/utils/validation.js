const Joi = require("joi");
const roles = require("../constants/roles");
const platforms = require("../constants/platforms");

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  userrole: Joi.string()
    .valid(...roles)
    .required(),
  tenantId: Joi.string().allow(null, ""),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  platform: Joi.string()
    .valid(...platforms)
    .required(),
});

const verifyOTPSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required(),
  platform: Joi.string()
    .valid(...platforms)
    .required(),
});

const verifyRegisterOTPSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required(),
});

const logoutSchema = Joi.object({
  email: Joi.string().email().required(),
  platform: Joi.string()
    .valid(...platforms)
    .required(),
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
  platform: Joi.string()
    .valid(...platforms)
    .required(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(8).required(),
});

const createLeadSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().allow(null, ""),
  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .allow(null, ""),
  source: Joi.string().allow(null, ""),
  status: Joi.string()
    .valid("New", "Contacted", "Qualified", "Converted")
    .default("New"),
  tags: Joi.array().items(Joi.string()).default([]),
  assignedTo: Joi.number().integer().allow(null),
  tenantId: Joi.string().required(),
  activities: Joi.array().items(Joi.object()).default([]),
  notes: Joi.array().items(Joi.object()).default([]),
});

const updateLeadSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  email: Joi.string().email().allow(null, ""),
  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .allow(null, ""),
  source: Joi.string().allow(null, ""),
  status: Joi.string().valid("New", "Contacted", "Qualified", "Converted"),
  tags: Joi.array().items(Joi.string()),
  assignedTo: Joi.number().integer().allow(null),
  tenantId: Joi.string().required(),
  activities: Joi.array().items(Joi.object()),
  notes: Joi.array().items(Joi.object()),
}).min(1);

const listLeadsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string()
    .valid("New", "Contacted", "Qualified", "Converted")
    .allow(null, ""),
  source: Joi.string().allow(null, ""),
  ownerId: Joi.number().integer().allow(null),
  search: Joi.string().allow(null, ""),
  tenantId: Joi.string().required(),
});

const getLeadSchema = Joi.object({
  params: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),
  query: Joi.object({
    tenantId: Joi.string().uuid().required(),
  }),
});

const listLeadScoresSchema = Joi.object({
  tenantId: Joi.string().required(),
});

const leadScoreSchema = Joi.object({
  event: Joi.string().required(),
  points: Joi.number().integer().required(),
  condition: Joi.string().allow(null, ""),
  tenantId: Joi.string().required(),
  leadId: Joi.number().integer().positive().required(),
});

const createTenantSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
});

module.exports = {
  registerSchema,
  loginSchema,
  verifyOTPSchema,
  verifyRegisterOTPSchema,
  logoutSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  createLeadSchema,
  updateLeadSchema,
  listLeadsSchema,
  getLeadSchema,
  listLeadScoresSchema,
  leadScoreSchema,
  createTenantSchema,
};
