const express = require("express");
const router = express.Router();
const { authenticate } = require("../../middlewares/auth.middleware");
const { validate } = require("../../middlewares/validate.middleware");
const {
  createLeadController,
} = require("../../controllers/leads/createLead.controller");
const {
  listLeadsController,
} = require("../../controllers/leads/listLeads.controller");
const {
  getLeadController,
} = require("../../controllers/leads/getLead.controller");
const {
  updateLeadController,
} = require("../../controllers/leads/updateLead.controller");
const {
  archiveLeadController,
} = require("../../controllers/leads/archiveLead.controller");
const {
  createOrUpdateLeadScoreController,
} = require("../../controllers/leads/leadScores/createOrUpdateLeadScore.controller");
const {
  listLeadScoresController,
} = require("../../controllers/leads/leadScores/listLeadScores.controller");
const {
  createLeadSchema,
  updateLeadSchema,
  listLeadsSchema,
  getLeadSchema,
  listLeadScoresSchema,
  leadScoreSchema,
} = require("../../utils/validation");

/**
 * @swagger
 * tags:
 *   name: Leads
 *   description: Lead management endpoints
 */

/**
 * @swagger
 * /api/leads:
 *   get:
 *     summary: List leads
 *     tags: [Leads]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of leads per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [New, Contacted, Qualified, Converted]
 *         description: Filter by lead status
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *         description: Filter by lead source
 *       - in: query
 *         name: ownerId
 *         schema:
 *           type: integer
 *         description: Filter by owner ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email
 *       - in: query
 *         name: tenantId
 *         schema:
 *           type: string
 *         required: true
 *         description: Tenant ID
 *     responses:
 *       200:
 *         description: List of leads
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       status:
 *                         type: string
 *                       source:
 *                         type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     total_pages:
 *                       type: integer
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/",
  validate({ query: listLeadsSchema }),
  authenticate,
  listLeadsController
);

/**
 * @swagger
 * /api/leads/{id}:
 *   get:
 *     summary: Get lead details
 *     tags: [Leads]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Lead ID
 *       - in: query
 *         name: tenantId
 *         schema:
 *           type: string
 *         required: true
 *         description: Tenant ID
 *     responses:
 *       200:
 *         description: Lead details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 phone:
 *                   type: string
 *                 source:
 *                   type: string
 *                 company:
 *                   type: string
 *                 status:
 *                   type: string
 *                 tags:
 *                   type: array
 *                   items:
 *                     type: string
 *                 description:
 *                   type: string
 *                 owner:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                 assignedTo:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                 activities:
 *                   type: array
 *                   items:
 *                     type: object
 *                 notes:
 *                   type: array
 *                   items:
 *                     type: object
 *                 attachments:
 *                   type: array
 *                   items:
 *                     type: object
 *                 score:
 *                   type: integer
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Lead not found
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/:id",
  validate({ params: getLeadSchema.params, query: getLeadSchema.query }),
  authenticate,
  getLeadController
);

/**
 * @swagger
 * /api/leads:
 *   post:
 *     summary: Create a new lead
 *     tags: [Leads]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Lead's name
 *               email:
 *                 type: string
 *                 description: Lead's email
 *               phone:
 *                 type: string
 *                 description: Lead's phone number
 *               source:
 *                 type: string
 *                 description: Lead source
 *               company:
 *                 type: string
 *                 description: Lead's company
 *               status:
 *                 type: string
 *                 enum: [New, Contacted, Qualified, Converted]
 *                 description: Lead status
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Lead tags
 *               description:
 *                 type: string
 *                 description: Lead description
 *               assignedTo:
 *                 type: integer
 *                 description: ID of user assigned to lead
 *               tenantId:
 *                 type: string
 *                 description: Tenant ID
 *               activities:
 *                 type: array
 *                 items:
 *                   type: object
 *                 description: Lead activities
 *               notes:
 *                 type: array
 *                 items:
 *                   type: object
 *                 description: Lead notes
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: object
 *                 description: Lead attachments
 *             required:
 *               - name
 *               - tenantId
 *     responses:
 *       201:
 *         description: Lead created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 lead:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/",
  validate({ body: createLeadSchema }),
  authenticate,
  createLeadController
);

/**
 * @swagger
 * /api/leads/{id}:
 *   put:
 *     summary: Update a lead
 *     tags: [Leads]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Lead ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               source:
 *                 type: string
 *               company:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [New, Contacted, Qualified, Converted]
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               description:
 *                 type: string
 *               assignedTo:
 *                 type: integer
 *               tenantId:
 *                 type: string
 *                 description: Tenant ID
 *               activities:
 *                 type: array
 *                 items:
 *                   type: object
 *               notes:
 *                 type: array
 *                 items:
 *                   type: object
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: object
 *             required:
 *               - tenantId
 *     responses:
 *       200:
 *         description: Lead updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 lead:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *     security:
 *       - bearerAuth: []
 */
router.put(
  "/:id",
  validate({ params: getLeadSchema.params, body: updateLeadSchema }),
  authenticate,
  updateLeadController
);

/**
 * @swagger
 * /api/leads/{id}:
 *   delete:
 *     summary: Archive a lead
 *     tags: [Leads]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Lead ID
 *       - in: query
 *         name: tenantId
 *         schema:
 *           type: string
 *         required: true
 *         description: Tenant ID
 *     responses:
 *       204:
 *         description: Lead archived
 *       404:
 *         description: Lead not found
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  "/:id",
  validate({ params: getLeadSchema.params, query: getLeadSchema.query }),
  authenticate,
  archiveLeadController
);

/**
 * @swagger
 * /api/leads/lead-scores:
 *   get:
 *     summary: List lead scores
 *     tags: [Leads]
 *     parameters:
 *       - in: query
 *         name: tenantId
 *         schema:
 *           type: string
 *         required: true
 *         description: Tenant ID
 *     responses:
 *       200:
 *         description: List of lead scores
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       event:
 *                         type: string
 *                       points:
 *                         type: integer
 *                       condition:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/lead-scores",
  validate({ query: listLeadScoresSchema }),
  authenticate,
  listLeadScoresController
);

/**
 * @swagger
 * /api/leads/lead-scores:
 *   post:
 *     summary: Create or update a lead score
 *     tags: [Leads]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event:
 *                 type: string
 *                 description: Event name
 *               points:
 *                 type: integer
 *                 description: Points for the event
 *               condition:
 *                 type: string
 *                 description: Optional condition
 *               tenantId:
 *                 type: string
 *                 description: Tenant ID
 *             required:
 *               - event
 *               - points
 *               - tenantId
 *     responses:
 *       201:
 *         description: Lead score created or updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 leadScore:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     event:
 *                       type: string
 *                     points:
 *                       type: integer
 *                     condition:
 *                       type: string
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/lead-scores",
  validate({ body: leadScoreSchema }),
  authenticate,
  createOrUpdateLeadScoreController
);

module.exports = router;
