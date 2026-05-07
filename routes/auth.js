const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes (no authentication required)
router.post('/owner/login', authController.ownerLogin);
router.post('/worker/send-otp', authController.sendWorkerOTP);
router.post('/worker/login', authController.workerLogin);
router.post('/donor/login', authController.donorLogin);

// Protected routes (authentication required)
router.post('/verify-token', authMiddleware, authController.verifyToken);
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;
