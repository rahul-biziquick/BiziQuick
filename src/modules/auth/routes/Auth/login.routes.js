const express = require("express");
const router = express.Router();
const { validate } = require("../../../../shared/middlewares/validate.middleware");
const { loginSchema } = require("../../../../shared/utils/validation");
const { loginController } = require("../../../../modules/auth/controllers/Auth/login.controller");

// Validate controller import
if (!loginController) {
  throw new Error(
    "loginController is undefined. Check import in controller file."
  );
}

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     description: Initiates user login by validating credentials and sending a 6-digit OTP to the provided email. Supports WEB and MOBILE platforms. Optionally accepts a redirect URI for WEB clients.
 *     operationId: loginUser
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
 *       - in: query
 *         name: redirectUri
 *         schema:
 *           type: string
 *           format: uri
 *           example: https://app.example.com/callback
 *         required: false
 *         description: Optional redirect URI for WEB platform to redirect after successful login.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - platform
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *                 description: User's email address.
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: Password123!
 *                 description: User's password.
 *               platform:
 *                 type: string
 *                 enum: [WEB, MOBILE]
 *                 example: WEB
 *                 description: Platform identifier (must match X-Platform header).
 *           example:
 *             email: john.doe@example.com
 *             password: Password123!
 *             platform: WEB
 *     responses:
 *       200:
 *         description: Login successful, OTP sent to email.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OTP sent to your email
 *                 pendingToken:
 *                   type: string
 *                   example: 123e4567-e89b-12d3-a456-426614174000
 *                   description: Temporary token for OTP verification.
 *                 platform:
 *                   type: string
 *                   example: WEB
 *                   description: Platform for which the OTP was issued.
 *                 otp:
 *                   type: string
 *                   example: 123456
 *                   description: OTP code (returned only in development environment for testing).
 *             example:
 *               message: OTP sent to your email
 *               pendingToken: 123e4567-e89b-12d3-a456-426614174000
 *               platform: WEB
 *               otp: 123456
 *         links:
 *           verifyLoginOTP:
 *             operationId: verifyLoginOTP
 *             parameters:
 *               email: $request.body.email
 *               platform: $request.body.platform
 *               pendingToken: $response.body#/pendingToken
 *             description: Use the `email`, `platform`, and `pendingToken` from this response to verify the OTP with the `/api/auth/verify-otp` endpoint.
 *       400:
 *         description: Invalid platform or input data (e.g., missing fields, invalid email format).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Invalid platform
 *       401:
 *         description: Invalid credentials or unverified email.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Invalid credentials
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Internal server error
 */
router.post("/", validate({ body: loginSchema }), loginController);

module.exports = router;
