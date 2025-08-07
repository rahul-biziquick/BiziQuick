const express = require("express");
const router = express.Router();
const { authenticate } = require("../../../../shared/middlewares/auth.middleware");
const { validate } = require("../../../../shared/middlewares/validate.middleware");
const {
  createLeadController,
  listLeadsController,
  getLeadController,
  updateLeadController,
  archiveLeadController,
} = require("../../../../modules/crm/controllers/leads");
const {
  createLeadSchema,
  updateLeadSchema,
  listLeadsSchema,
  getLeadSchema,
} = require("../../utils/validation");

if (
  !createLeadController ||
  !listLeadsController ||
  !getLeadController ||
  !updateLeadController ||
  !archiveLeadController
) {
  throw new Error(
    "One or more lead controllers are undefined. Check imports in controller files."
  );
}

/**
 * @swagger
 * tags:
 *   - name: Leads
 *     description: Lead management endpoints for creating, retrieving, updating, and archiving leads (WEB and MOBILE platforms)
 *     externalDocs:
 *       description: Lead Management Documentation
 *       url: https://docs.example.com/leads
 */

/**
 * @swagger
 * leads:
 *   get:
 *     summary: List leads
 *     description: Retrieves a paginated list of leads with optional filters for status, source, owner, and search term. Supports WEB and MOBILE platforms. Requires a valid JWT access token and tenant ID.
 *     operationId: listLeads
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
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of leads per page.
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [New, Contacted, Qualified, Converted]
 *           example: New
 *         description: Filter by lead status.
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *           example: Website
 *         description: Filter by lead source (e.g., Website, Referral).
 *       - in: query
 *         name: ownerId
 *         schema:
 *           type: integer
 *           example: 101
 *         description: Filter by owner ID.
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           example: John Doe
 *         description: Search by lead name or email.
 *       - in: query
 *         name: tenantId
 *         schema:
 *           type: string
 *           example: tenant123
 *         required: true
 *         description: Tenant ID for multi-tenancy support.
 *     responses:
 *       200:
 *         description: List of leads retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Lead'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                       description: Current page number.
 *                     total_pages:
 *                       type: integer
 *                       example: 5
 *                       description: Total number of pages.
 *                     total_items:
 *                       type: integer
 *                       example: 50
 *                       description: Total number of leads.
 *             example:
 *               data:
 *                 - id: 1
 *                   name: John Doe
 *                   email: john.doe@example.com
 *                   status: New
 *                   source: Website
 *                 - id: 2
 *                   name: Jane Smith
 *                   email: jane.smith@example.com
 *                   status: Contacted
 *                   source: Referral
 *               pagination:
 *                 page: 1
 *                 total_pages: 5
 *                 total_items: 50
 *       400:
 *         description: Invalid query parameters (e.g., negative page, invalid status).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Invalid query parameters
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
  validate({ query: listLeadsSchema }),
  authenticate,
  listLeadsController
);

/**
 * @swagger
 * /leads/{id}:
 *   get:
 *     summary: Get lead details
 *     description: Retrieves detailed information for a specific lead by ID. Supports WEB and MOBILE platforms. Requires a valid JWT access token and tenant ID.
 *     operationId: getLead
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
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *         required: true
 *         description: Unique identifier of the lead.
 *       - in: query
 *         name: tenantId
 *         schema:
 *           type: string
 *           example: tenant123
 *         required: true
 *         description: Tenant ID for multi-tenancy support.
 *     responses:
 *       200:
 *         description: Lead details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lead'
 *             example:
 *               id: 1
 *               name: John Doe
 *               email: john.doe@example.com
 *               phone: +1-555-555-5555
 *               source: Website
 *               company: Acme Corp
 *               status: New
 *               tags: ["urgent", "high-value"]
 *               description: Interested in product demo.
 *               owner:
 *                 id: 101
 *                 name: Jane Smith
 *                 email: jane.smith@example.com
 *               assignedTo:
 *                 id: 102
 *                 name: Bob Johnson
 *                 email: bob.johnson@example.com
 *               activities:
 *                 - id: 1
 *                   type: Call
 *                   description: Initial call scheduled
 *               notes:
 *                 - id: 1
 *                   content: Lead is interested in pricing
 *               attachments:
 *                 - id: 1
 *                   url: https://example.com/doc.pdf
 *               score: 75
 *               createdAt: 2025-06-23T12:00:00Z
 *               updatedAt: 2025-06-23T12:30:00Z
 *       400:
 *         description: Invalid lead ID or tenant ID.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Invalid lead ID
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
 *       404:
 *         description: Lead not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Lead not found
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
  "/:id",
  validate({ params: getLeadSchema.params, query: getLeadSchema.query }),
  authenticate,
  getLeadController
);

/**
 * @swagger
 * /leads:
 *   post:
 *     summary: Create a new lead
 *     description: Creates a new lead with the provided details. Supports WEB and MOBILE platforms. Requires a valid JWT access token and tenant ID.
 *     operationId: createLead
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
 *               - name
 *               - tenantId
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *                 example: John Doe
 *                 description: Full name of the lead (max 100 characters).
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *                 description: Email address of the lead.
 *               phone:
 *                 type: string
 *                 maxLength: 20
 *                 example: +1-555-555-5555
 *                 description: Phone number of the lead.
 *               source:
 *                 type: string
 *                 example: Website
 *                 description: Source of the lead (e.g., Website, Referral).
 *               company:
 *                 type: string
 *                 maxLength: 100
 *                 example: Acme Corp
 *                 description: Company name associated with the lead.
 *               status:
 *                 type: string
 *                 enum: [New, Contacted, Qualified, Converted]
 *                 example: New
 *                 description: Initial status of the lead.
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["urgent", "high-value"]
 *                 description: Tags for categorizing the lead.
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 example: Interested in product demo.
 *                 description: Additional details about the lead.
 *               assignedTo:
 *                 type: integer
 *                 example: 102
 *                 description: ID of the user assigned to the lead.
 *               tenantId:
 *                 type: string
 *                 example: tenant123
 *                 description: Tenant ID for multi-tenancy support.
 *               activities:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                     description:
 *                       type: string
 *                 example: [{ type: "Call", description: "Initial call scheduled" }]
 *                 description: Initial activities for the lead.
 *               notes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     content:
 *                       type: string
 *                 example: [{ content: "Lead is interested in pricing" }]
 *                 description: Initial notes for the lead.
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                 example: [{ url: "https://example.com/doc.pdf" }]
 *                 description: Initial attachments for the lead.
 *           example:
 *             name: John Doe
 *             email: john.doe@example.com
 *             phone: +1-555-555-5555
 *             source: Website
 *             company: Acme Corp
 *             status: New
 *             tags: ["urgent", "high-value"]
 *             description: Interested in product demo.
 *             assignedTo: 102
 *             tenantId: tenant123
 *             activities: [{ type: "Call", description: "Initial call scheduled" }]
 *             notes: [{ content: "Lead is interested in pricing" }]
 *             attachments: [{ url: "https://example.com/doc.pdf" }]
 *     responses:
 *       201:
 *         description: Lead created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Lead created successfully
 *                 lead:
 *                   $ref: '#/components/schemas/Lead'
 *             example:
 *               message: Lead created successfully
 *               lead:
 *                 id: 1
 *                 name: John Doe
 *                 email: john.doe@example.com
 *                 phone: +1-555-555-5555
 *                 source: Website
 *                 company: Acme Corp
 *                 status: New
 *                 tags: ["urgent", "high-value"]
 *                 description: Interested in product demo.
 *                 assignedTo:
 *                   id: 102
 *                   name: Bob Johnson
 *                   email: bob.johnson@example.com
 *                 tenantId: tenant123
 *         links:
 *           getLead:
 *             operationId: getLead
 *             parameters:
 *               id: $response.body#/lead/id
 *               tenantId: $request.body.tenantId
 *             description: Use the `id` from the response and `tenantId` from the request to retrieve the lead details with the `/api/leads/{id}` endpoint.
 *       400:
 *         description: Invalid input data (e.g., missing name, invalid email).
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
 *       409:
 *         description: Lead with this email already exists.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Lead with this email already exists
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
  validate({ body: createLeadSchema }),
  authenticate,
  createLeadController
);

/**
 * @swagger
 * /leads/{id}:
 *   put:
 *     summary: Update a lead
 *     description: Updates the details of an existing lead by ID. Supports WEB and MOBILE platforms. Requires a valid JWT access token and tenant ID.
 *     operationId: updateLead
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
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *         required: true
 *         description: Unique identifier of the lead.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tenantId
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *                 example: John Doe
 *                 description: Full name of the lead (max 100 characters).
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *                 description: Email address of the lead.
 *               phone:
 *                 type: string
 *                 maxLength: 20
 *                 example: +1-555-555-5555
 *                 description: Phone number of the lead.
 *               source:
 *                 type: string
 *                 example: Website
 *                 description: Source of the lead (e.g., Website, Referral).
 *               company:
 *                 type: string
 *                 maxLength: 100
 *                 example: Acme Corp
 *                 description: Company name associated with the lead.
 *               status:
 *                 type: string
 *                 enum: [New, Contacted, Qualified, Converted]
 *                 example: Contacted
 *                 description: Updated status of the lead.
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["urgent", "high-value"]
 *                 description: Tags for categorizing the lead.
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 example: Updated interest in product demo.
 *                 description: Additional details about the lead.
 *               assignedTo:
 *                 type: integer
 *                 example: 102
 *                 description: ID of the user assigned to the lead.
 *               tenantId:
 *                 type: string
 *                 example: tenant123
 *                 description: Tenant ID for multi-tenancy support.
 *               activities:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                     description:
 *                       type: string
 *                 example: [{ type: "Email", description: "Sent follow-up email" }]
 *                 description: Updated activities for the lead.
 *               notes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     content:
 *                       type: string
 *                 example: [{ content: "Lead requested demo" }]
 *                 description: Updated notes for the lead.
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                 example: [{ url: "https://example.com/updated.pdf" }]
 *                 description: Updated attachments for the lead.
 *           example:
 *             name: John Doe
 *             email: john.doe@example.com
 *             phone: +1-555-555-5555
 *             source: Website
 *             company: Acme Corp
 *             status: Contacted
 *             tags: ["urgent", "high-value"]
 *             description: Updated interest in product demo.
 *             assignedTo: 102
 *             tenantId: tenant123
 *             activities: [{ type: "Email", description: "Sent follow-up email" }]
 *             notes: [{ content: "Lead requested demo" }]
 *             attachments: [{ url: "https://example.com/updated.pdf" }]
 *     responses:
 *       200:
 *         description: Lead updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Lead updated successfully
 *                 lead:
 *                   $ref: '#/components/schemas/Lead'
 *             example:
 *               message: Lead updated successfully
 *               lead:
 *                 id: 1
 *                 name: John Doe
 *                 email: john.doe@example.com
 *                 phone: +1-555-555-5555
 *                 source: Website
 *                 company: Acme Corp
 *                 status: Contacted
 *                 tags: ["urgent", "high-value"]
 *                 description: Updated interest in product demo.
 *                 assignedTo:
 *                   id: 102
 *                   name: Bob Johnson
 *                   email: bob.johnson@example.com
 *                 tenantId: tenant123
 *         links:
 *           getLead:
 *             operationId: getLead
 *             parameters:
 *               id: $request.path.id
 *               tenantId: $request.body.tenantId
 *             description: Use the `id` from the request path and `tenantId` from the request body to retrieve the updated lead details with the `/api/leads/{id}` endpoint.
 *       400:
 *         description: Invalid input data (e.g., invalid email, missing tenantId).
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
 *       404:
 *         description: Lead not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Lead not found
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Internal server error
 */
router.put(
  "/:id",
  validate({ params: getLeadSchema.params, body: updateLeadSchema }),
  authenticate,
  updateLeadController
);

/**
 * @swagger
 * /leads/{id}:
 *   delete:
 *     summary: Archive a lead
 *     description: Archives a lead by ID, marking it as inactive. Supports WEB and MOBILE platforms. Requires a valid JWT access token and tenant ID.
 *     operationId: archiveLead
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
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *         required: true
 *         description: Unique identifier of the lead.
 *       - in: query
 *         name: tenantId
 *         schema:
 *           type: string
 *           example: tenant123
 *         required: true
 *         description: Tenant ID for multi-tenancy support.
 *     responses:
 *       204:
 *         description: Lead archived successfully.
 *       400:
 *         description: Invalid lead ID or tenant ID.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Invalid lead ID
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
 *       404:
 *         description: Lead not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Lead not found
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Internal server error
 */
router.delete(
  "/:id",
  validate({ params: getLeadSchema.params, query: getLeadSchema.query }),
  authenticate,
  archiveLeadController
);

module.exports = router;
