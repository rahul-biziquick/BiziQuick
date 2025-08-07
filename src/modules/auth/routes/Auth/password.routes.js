const express = require("express");
const router = express.Router();
const { validate } = require("../../../../shared/middlewares/validate.middleware");
const {
  forgotPasswordSchema,
  resetPasswordSchema,
} = require("../../../../shared/utils/validation");
const {
  forgotPasswordController,
} = require("../../../auth/controllers/Auth/forgotPassword.controller");
const {
  resetPasswordController,
} = require("../../../auth/controllers/Auth/resetPassword.controller");

// Validate controller imports
if (!forgotPasswordController || !resetPasswordController) {
  throw new Error(
    "One or more password controllers are undefined. Check imports in controller files."
  );
}

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     description: Sends a 6-digit OTP to the user's email for password reset. Supports WEB and MOBILE platforms. Rate-limited to 5 requests per minute per IP.
 *     operationId: forgotPassword
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
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *                 description: User's email address to receive the reset OTP.
 *           example:
 *             email: john.doe@example.com
 *     responses:
 *       200:
 *         description: Password reset OTP sent to email.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password reset OTP sent to your email
 *                 otp:
 *                   type: string
 *                   example: 123456
 *                   description: OTP code (returned only in development environment for testing).
 *             example:
 *               message: Password reset OTP sent to your email
 *               otp: 123456
 *         links:
 *           resetPassword:
 *             operationId: resetPassword
 *             parameters:
 *               email: $request.body.email
 *             description: Use the `email` from the request and the OTP sent to reset the password with the `/api/auth/reset-password` endpoint.
 *       400:
 *         description: Invalid email format.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Invalid email
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: User not found
 *       429:
 *         description: Too many requests (rate limit exceeded).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Too many requests, please try again later
 *                 retryAfter:
 *                   type: integer
 *                   example: 60
 *                   description: Seconds to wait before retrying.
 *             example:
 *               error: Too many requests, please try again later
 *               retryAfter: 60
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
  "/forgot-password",

  validate({ body: forgotPasswordSchema }),
  forgotPasswordController
);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password using OTP
 *     description: Resets the user's password using the 6-digit OTP sent via email. Supports WEB and MOBILE platforms.
 *     operationId: resetPassword
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
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *                 description: User's email address associated with the OTP.
 *               otp:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 6
 *                 example: 123456
 *                 description: 6-digit OTP sent to the user's email.
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 example: NewPassword123!
 *                 description: New password (minimum 8 characters, including letters, numbers, and special characters).
 *           example:
 *             email: john.doe@example.com
 *             otp: 123456
 *             newPassword: NewPassword123!
 *     responses:
 *       200:
 *         description: Password reset successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password reset successfully
 *             example:
 *               message: Password reset successfully
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
  "/reset-password",
  validate({ body: resetPasswordSchema }),
  resetPasswordController
);

module.exports = router;
