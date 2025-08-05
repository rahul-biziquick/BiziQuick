const express = require("express");
const router = express.Router();
const { authenticate } = require("../../middlewares/auth.middleware");
const { validate } = require("../../middlewares/validate.middleware");
const { logoutSchema } = require("../../utils/validation");
const {
  logoutController,
} = require("../../controllers/Auth/logout.controller");

// Validate controller import
if (!logoutController) {
  throw new Error(
    "logoutController is undefined. Check import in controller file."
  );
}

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout current user
 *     description: Terminates the user session and clears the refresh token cookie for WEB clients or invalidates the refresh token for MOBILE clients. Requires a valid JWT access token.
 *     operationId: logoutUser
 *     tags: [Auth]
 *     deprecated: false
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         schema:
 *           type: string
 *           example: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         required: true
 *         description: JWT access token for authentication.
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
 *               - platform
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *                 description: User's email address.
 *               platform:
 *                 type: string
 *                 enum: [WEB, MOBILE]
 *                 example: WEB
 *                 description: Platform identifier (must match X-Platform header).
 *           example:
 *             email: john.doe@example.com
 *             platform: WEB
 *     responses:
 *       200:
 *         description: Logged out successfully, refresh token cookie cleared (WEB) or invalidated (MOBILE).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logged out successfully
 *             example:
 *               message: Logged out successfully
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: webRefreshToken=; HttpOnly; Secure; Max-Age=0
 *             description: Clears the refresh token cookie for WEB clients.
 *       400:
 *         description: Invalid input or no active session found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: No active session found for this platform
 *       401:
 *         description: Unauthorized due to invalid or missing access token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Unauthorized
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
  "/",
  authenticate,
  validate({ body: logoutSchema }),
  logoutController
);

module.exports = router;
