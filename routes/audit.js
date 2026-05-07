const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// All audit routes require owner or worker role
router.use(authMiddleware);
router.use(roleMiddleware.ownerOrWorker);

// Get all audit logs
router.get('/', auditController.getAuditLogs);

// Get audit log by ID
router.get('/:auditLogId', auditController.getAuditLogById);

// Get audit logs by entity
router.get('/entity/:entityType/:entityId', auditController.getAuditLogsByEntity);

// Get audit logs by user
router.get('/user/:userId', auditController.getAuditLogsByUser);

// Get audit statistics
router.get('/stats', auditController.getAuditStats);

// Get recent activity
router.get('/activity/recent', auditController.getRecentActivity);

// Get failed attempts
router.get('/attempts/failed', auditController.getFailedAttempts);

// Export audit logs
router.get('/export', auditController.exportAuditLogs);

module.exports = router;
