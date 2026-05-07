const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Get notifications for user
router.get('/', notificationController.getNotifications);

// Get notification by ID
router.get('/:notificationId', notificationController.getNotificationById);

// Mark notification as read
router.put('/:notificationId/read', notificationController.markAsRead);

// Mark multiple notifications as read
router.put('/mark-read', notificationController.markMultipleAsRead);

// Mark all notifications as read
router.put('/mark-all-read', notificationController.markAllAsRead);

// Delete notification
router.delete('/:notificationId', notificationController.deleteNotification);

// Get unread count
router.get('/unread/count', notificationController.getUnreadCount);

// Create reminder notification
router.post('/reminder', notificationController.createReminder);

// Get notification statistics
router.get('/stats', notificationController.getNotificationStats);

// System routes (owner only)
router.post('/system-alert', roleMiddleware.owner, notificationController.createSystemAlert);
router.post('/send-scheduled', roleMiddleware.owner, notificationController.sendScheduledNotifications);

module.exports = router;
