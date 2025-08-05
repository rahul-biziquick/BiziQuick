const express = require("express");
const router = express.Router();
const { validate } = require("../../../../shared/middlewares/validate.middleware");
const { registerSchema } = require("../../../../shared/utils/validation");
const {
  registerController,
} = require("../../controllers/Auth/register.controller");

// Validate controller import
if (!registerController) {
  throw new Error(
    "registerController is undefined. Check import in controller file."
  );
}

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication endpoints for user management (WEB and MOBILE platforms)
 *     externalDocs:
 *       description: Authentication Flow Documentation
 *       url: https://docs.example.com/auth
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account and sends a 6-digit OTP to the provided email for verification. Supports WEB and MOBILE platforms. Requires a valid tenant ID for multi-tenancy.
 *     operationId: registerUser
 *     tags: [Auth]
 *     deprecated: false
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
 *               - email
 *               - password
 *               - userrole
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *                 example: John Doe
 *                 description: Full name of the user (max 100 characters).
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *                 description: User's email address for login and OTP delivery.
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: Password123!
 *                 description: Password with minimum 8 characters, including at least one letter, one number, and one special character.
 *               userrole:
 *                 type: string
 *                 enum: [SUPER_ADMIN, ADMIN, MANAGER, SALES_EXECUTIVE, SUPPORT_EXECUTIVE]
 *                 example: MANAGER
 *                 description: Role assigned to the user, determining access permissions.
 *               tenantId:
 *                 type: string
 *                 example: tenant123
 *                 description: Optional tenant ID for multi-tenancy support. Required for non-default tenants.
 *           example:
 *             name: John Doe
 *             email: john.doe@example.com
 *             password: Password123!
 *             userrole: MANAGER
 *             tenantId: tenant123
 *     responses:
 *       201:
 *         description: User registered successfully, OTP sent to email.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OTP sent to your email. Please verify.
 *                 userId:
 *                   type: string
 *                   example: user123
 *                   description: Unique identifier of the newly created user.
 *                 otp:
 *                   type: string
 *                   example: 123456
 *                   description: OTP code (returned only in development environment for testing).
 *             example:
 *               message: OTP sent to your email. Please verify.
 *               userId: user123
 *               otp: 123456
 *         links:
 *           verifyRegisterOTP:
 *             operationId: verifyRegisterOTP
 *             parameters:
 *               email: $request.body.email
 *               userId: $response.body#/userId
 *             description: Use the `email` from the request and `userId` from the response to verify the OTP with the `/api/auth/verify-register-otp` endpoint.
 *       400:
 *         description: Invalid input data (e.g., invalid email format, missing fields, or invalid role/tenant ID).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Invalid input data
 *       409:
 *         description: Email already registered.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Email already registered
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Internal server error
 */
router.post("/", validate({ body: registerSchema }), registerController);

module.exports = router;
