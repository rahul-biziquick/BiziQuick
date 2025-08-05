const express = require("express");
const router = express.Router();
const { validate } = require("../../middlewares/validate.middleware");
const { refreshTokenSchema } = require("../../utils/validation");
const {
  refreshTokenController,
} = require("../../controllers/Auth/refreshToken.controller");

// Validate controller import
if (!refreshTokenController) {
  throw new Error(
    "refreshTokenController is undefined. Check import in controller file."
  );
}

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh JWT access token
 *     description: Generates a new JWT access token using a valid refresh token. Supports WEB and MOBILE platforms. For WEB clients, the refresh token can be sent as a cookie (`webRefreshToken`).
 *     operationId: refreshToken
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
 *               - refreshToken
 *               - platform
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 description: JWT refresh token (can also be sent as a cookie named `webRefreshToken` or `mobileRefreshToken`).
 *               platform:
 *                 type: string
 *                 enum: [WEB, MOBILE]
 *                 example: WEB
 *                 description: Platform identifier (must match X-Platform header).
 *           example:
 *             refreshToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *             platform: WEB
 *     responses:
 *       200:
 *         description: New access token issued.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                   description: New JWT access token (expires in 15 minutes).
 *             example:
 *               accessToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Missing or invalid refresh token or platform.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Refresh token is required
 *       403:
 *         description: Invalid or expired refresh token, or session invalidated.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Refresh token expired or invalid
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
  validate({ body: refreshTokenSchema }),
  refreshTokenController
);

module.exports = router;
