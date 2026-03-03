const express = require('express');
const router = express.Router();
const securityController = require('../controllers/securityController');
const { auth } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Security
 *   description: Security features including 2FA, device management, and session management
 */

router.use(auth);

// 2FA/MFA
/**
 * @swagger
 * /api/v1/security/2fa/setup:
 *   post:
 *     summary: Setup two-factor authentication
 *     description: Initialize 2FA setup and get QR code for authenticator app
 *     tags: [Security]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 2FA setup initiated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 secret:
 *                   type: string
 *                   description: Secret key for authenticator app
 *                 qrCode:
 *                   type: string
 *                   format: uri
 *                   description: QR code data URI for scanning
 *       401:
 *         description: Unauthorized
 */
router.post('/2fa/setup', securityController.setup2FA);

/**
 * @swagger
 * /api/v1/security/2fa/verify:
 *   post:
 *     summary: Verify 2FA setup
 *     description: Verify and complete 2FA setup with a token from authenticator app
 *     tags: [Security]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: 6-digit token from authenticator app
 *     responses:
 *       200:
 *         description: 2FA enabled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 2FA enabled successfully
 *       400:
 *         description: Bad request (invalid token)
 *       401:
 *         description: Unauthorized
 */
router.post('/2fa/verify', securityController.verify2FA);

/**
 * @swagger
 * /api/v1/security/2fa/disable:
 *   post:
 *     summary: Disable two-factor authentication
 *     description: Disable 2FA for the user account
 *     tags: [Security]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: 6-digit token from authenticator app for verification
 *     responses:
 *       200:
 *         description: 2FA disabled successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/2fa/disable', securityController.disable2FA);

// Device Management
/**
 * @swagger
 * /api/v1/security/devices:
 *   get:
 *     summary: Get trusted devices
 *     description: Retrieve list of trusted devices for the user
 *     tags: [Security]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Devices retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 devices:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       lastUsed:
 *                         type: string
 *                         format: date-time
 *                       isTrusted:
 *                         type: boolean
 *       401:
 *         description: Unauthorized
 */
router.get('/devices', securityController.getDevices);

/**
 * @swagger
 * /api/v1/security/devices/{id}:
 *   delete:
 *     summary: Remove trusted device
 *     description: Remove a device from the trusted devices list
 *     tags: [Security]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Device ID
 *     responses:
 *       200:
 *         description: Device removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Device removed
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Device not found
 */
router.delete('/devices/:id', securityController.removeDevice);

// Session Management
/**
 * @swagger
 * /api/v1/security/sessions:
 *   get:
 *     summary: Get active sessions
 *     description: Retrieve list of active sessions for the user
 *     tags: [Security]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sessions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       device:
 *                         type: string
 *                       ipAddress:
 *                         type: string
 *                       lastActivity:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 */
router.get('/sessions', securityController.getSessions);

/**
 * @swagger
 * /api/v1/security/sessions/{id}:
 *   delete:
 *     summary: Revoke session
 *     description: Revoke a specific session
 *     tags: [Security]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID
 *     responses:
 *       200:
 *         description: Session revoked successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Session not found
 */
router.delete('/sessions/:id', securityController.revokeSession);

/**
 * @swagger
 * /api/v1/security/sessions:
 *   delete:
 *     summary: Revoke all sessions
 *     description: Revoke all active sessions except the current one
 *     tags: [Security]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All sessions revoked successfully
 *       401:
 *         description: Unauthorized
 */
router.delete('/sessions', securityController.revokeAllSessions);

// Login Attempts
/**
 * @swagger
 * /api/v1/security/login-attempts:
 *   get:
 *     summary: Get login attempts
 *     description: Retrieve recent login attempt history
 *     tags: [Security]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Login attempts retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/login-attempts', securityController.getLoginAttempts);

// API Keys
/**
 * @swagger
 * /api/v1/security/api-keys:
 *   get:
 *     summary: Get API keys
 *     description: Retrieve list of user's API keys
 *     tags: [Security]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: API keys retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 apiKeys:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       lastUsed:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 */
router.get('/api-keys', securityController.getAPIKeys);

/**
 * @swagger
 * /api/v1/security/api-keys:
 *   post:
 *     summary: Create API key
 *     description: Create a new API key for programmatic access
 *     tags: [Security]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name for the API key
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Permissions for the API key
 *     responses:
 *       201:
 *         description: API key created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 apiKey:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     key:
 *                       type: string
 *                       description: The API key (only shown once)
 *                     name:
 *                       type: string
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/api-keys', securityController.createAPIKey);

/**
 * @swagger
 * /api/v1/security/api-keys/{id}:
 *   delete:
 *     summary: Revoke API key
 *     description: Revoke and delete an API key
 *     tags: [Security]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: API key ID
 *     responses:
 *       200:
 *         description: API key revoked successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: API key not found
 */
router.delete('/api-keys/:id', securityController.revokeAPIKey);

module.exports = router;


