const express = require("express");
const router = express.Router();
const { authenticate } = require("../../middlewares/auth.middleware");
const { validate } = require("../../middlewares/validate.middleware");
const {
  createOrUpdateLeadScoreController,
  listLeadScoresController,
} = require("../../controllers/leads/leadScores");
const {
  listLeadScoresSchema,
  leadScoreSchema,
} = require("../../utils/validation");

// Validate controller imports
if (!createOrUpdateLeadScoreController || !listLeadScoresController) {
  throw new Error(
    "One or more lead score controllers are undefined. Check imports in controller files."
  );
}

/**
 * @swagger
 * /leads/lead-scores:
 *   get:
 *     summary: List lead scores
 *     description: Retrieves a list of lead scoring rules. Supports WEB and MOBILE platforms. Requires a valid JWT access token and tenant ID.
 *     operationId: listLeadScores
 *     tags: [Leads]
 *     deprecated: false
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: header
 *         name: X-Platform
 *         schema:
 *           type: string
 *           enum: [WEB, MOBILE]
 *         required: true
 *         description: Specifies the platform making the request (WEB or MOBILE).
 *       - in: header
 *         name: X-Correlation-Id
 *         schema:
 *           type: string
 *           format: uuid
 *           example: 123e4567-e89b-12d3-a456-426614174000
 *         required: false
 *         description: Optional correlation ID for request tracing across services.
 *       - in: query
 *         name: tenantId
 *         schema:
 *           type: string
 *           example: tenant123
 *         required: true
 *         description: Tenant ID for multi-tenancy support.
 *     responses:
 *       200:
 *         description: List of lead scores retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LeadScore'
 *             example:
 *               data:
 *                 - id: 1
 *                   event: Website Visit
 *                   points: 10
 *                   condition: Visited pricing page
 *                   createdAt: 2025-06-23T12:00:00Z
 *                   updatedAt: 2025-06-23T12:30:00Z
 *                 - id: 2
 *                   event: Form Submission
 *                   points: 20
 *                   condition: Submitted contact form
 *                   createdAt: 2025-06-23T12:00:00Z
 *                   updatedAt: 2025-06-23T12:30:00Z
 *       400:
 *         description: Invalid tenant ID.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Invalid tenant ID
 *       401:
 *         description: Unauthorized due to invalid or missing access token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Unauthorized
 *       403:
 *         description: Forbidden due to insufficient permissions.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Insufficient permissions
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Internal server error
 */
router.get(
  "/",
  validate({ query: listLeadScoresSchema }),
  authenticate,
  listLeadScoresController
);

/**
 * @swagger
 * /leads/lead-scores:
 *   post:
 *     summary: Create or update a lead score
 *     description: Creates a new lead scoring rule or updates an existing one based on the event. Supports WEB and MOBILE platforms. Requires a valid JWT access token and tenant ID.
 *     operationId: createOrUpdateLeadScore
 *     tags: [Leads]
 *     deprecated: false
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: header
 *         name: X-Platform
 *         schema:
 *           type: string
 *           enum: [WEB, MOBILE]
 *         required: true
 *         description: Specifies the platform making the request (WEB or MOBILE).
 *       - in: header
 *         name: X-Correlation-Id
 *         schema:
 *           type: string
 *           format: uuid
 *           example: 123e4567-e89b-12d3-a456-426614174000
 *         required: false
 *         description: Optional correlation ID for request tracing across services.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - event
 *               - points
 *               - tenantId
 *             properties:
 *               event:
 *                 type: string
 *                 maxLength: 100
 *                 example: Website Visit
 *                 description: Name of the event triggering the score (max 100 characters).
 *               points:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *                 example: 10
 *                 description: Points assigned for the event (0-100).
 *               condition:
 *                 type: string
 *                 maxLength: 200
 *                 example: Visited pricing page
 *                 description: Optional condition for the event (max 200 characters).
 *               tenantId:
 *                 type: string
 *                 example: tenant123
 *                 description: Tenant ID for multi-tenancy support.
 *           example:
 *             event: Website Visit
 *             points: 10
 *             condition: Visited pricing page
 *             tenantId: tenant123
 *     responses:
 *       201:
 *         description: Lead score created or updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Lead score created successfully
 *                 leadScore:
 *                   $ref: '#/components/schemas/LeadScore'
 *             example:
 *               message: Lead score created successfully
 *               leadScore:
 *                 id: 1
 *                 event: Website Visit
 *                 points: 10
 *                 condition: Visited pricing page
 *                 createdAt: 2025-06-23T12:00:00Z
 *                 updatedAt: 2025-06-23T12:00:00Z
 *         links:
 *           listLeadScores:
 *             operationId: listLeadScores
 *             parameters:
 *               tenantId: $request.body.tenantId
 *             description: Use the `tenantId` from the request to retrieve all lead scores with the `/api/leads/lead-scores` GET endpoint.
 *       400:
 *         description: Invalid input data (e.g., missing event, invalid points).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Invalid input data
 *       401:
 *         description: Unauthorized due to invalid or missing access token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Unauthorized
 *       403:
 *         description: Forbidden due to insufficient permissions.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Insufficient permissions
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Internal server error
 */
router.post(
  "/",
  validate({ body: leadScoreSchema }),
  authenticate,
  createOrUpdateLeadScoreController
);

module.exports = router;
