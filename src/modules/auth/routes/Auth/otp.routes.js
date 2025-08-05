const express = require("express");
const router = express.Router();
const { validate } = require("../../../../shared/middlewares/validate.middleware");
const {
  verifyOTPSchema,
  verifyRegisterOTPSchema,
} = require("../../../../shared/utils/validation");
const {
  verifyLoginOTPController,
} = require("../../controllers/Auth/verifyLoginOtp.controller");
const {
  verifyRegisterOTPController,
} = require("../../controllers/Auth/verifyRegisterOtp.controller");

// Validate controller imports
if (!verifyLoginOTPController || !verifyRegisterOTPController) {
  throw new Error(
    "One or more OTP controllers are undefined. Check imports in controller files."
  );
}

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify login OTP
 *     description: Verifies the 6-digit OTP sent during login and issues JWT access and refresh tokens. Supports WEB and MOBILE platforms. Sets a refresh token cookie for WEB clients.
 *     operationId: verifyLoginOTP
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
 *               - email
 *               - otp
 *               - platform
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *                 description: User's email address.
 *               otp:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 6
 *                 example: 123456
 *                 description: 6-digit OTP sent to the user's email.
 *               platform:
 *                 type: string
 *                 enum: [WEB, MOBILE]
 *                 example: WEB
 *                 description: Platform identifier (must match X-Platform header).
 *           example:
 *             email: john.doe@example.com
 *             otp: 123456
 *             platform: WEB
 *     responses:
 *       200:
 *         description: OTP verified, access and refresh tokens issued. For WEB clients, a `webRefreshToken` cookie is set (HTTP-only, secure, 7-day expiry).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                   description: JWT access token for authenticated requests (expires in 15 minutes).
 *                 refreshToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                   description: JWT refresh token for obtaining new access tokens (expires in 7 days). Returned in response for MOBILE clients; set as a cookie for WEB clients.
 *             example:
 *               message: Login successful
 *               accessToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *               refreshToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: webRefreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Secure; Max-Age=604800
 *             description: Sets a refresh token cookie for WEB clients (7-day expiry, HTTP-only, secure).
 *         links:
 *           logout:
 *             operationId: logoutUser
 *             parameters:
 *               email: $request.body.email
 *               platform: $request.body.platform
 *               Authorization: 'Bearer $response.body#/accessToken'
 *             description: Use the `accessToken`, `email`, and `platform` to log out with the `/api/auth/logout` endpoint.
 *           refreshToken:
 *             operationId: refreshToken
 *             parameters:
 *               refreshToken: $response.body#/refreshToken
 *               platform: $request.body.platform
 *             description: Use the `refreshToken` and `platform` to obtain a new access token with the `/api/auth/refresh-token` endpoint.
 *       400:
 *         description: Invalid or expired OTP, or invalid platform.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Invalid or expired OTP
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: User not found
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
  "/verify-otp",
  validate({ body: verifyOTPSchema }),
  verifyLoginOTPController
);

/**
 * @swagger
 * /auth/verify-register-otp:
 *   post:
 *     summary: Verify registration OTP
 *     description: Verifies the 6-digit OTP sent during registration to activate the user account. Supports WEB and MOBILE platforms.
 *     operationId: verifyRegisterOTP
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
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *                 description: User's email address.
 *               otp:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 6
 *                 example: 123456
 *                 description: 6-digit OTP sent to the user's email.
 *           example:
 *             email: john.doe@example.com
 *             otp: 123456
 *     responses:
 *       200:
 *         description: Account activated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email verified successfully
 *                 userId:
 *                   type: string
 *                   example: user123
 *                   description: Unique identifier of the verified user.
 *             example:
 *               message: Email verified successfully
 *               userId: user123
 *       400:
 *         description: Invalid or expired OTP.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Invalid or expired OTP
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: User not found
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
  "/verify-register-otp",
  validate({ body: verifyRegisterOTPSchema }),
  verifyRegisterOTPController
);

module.exports = router;
