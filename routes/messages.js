const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Send message
router.post('/', messageController.sendMessage);

// Get messages for user
router.get('/', messageController.getMessages);

// Get message by ID
router.get('/:messageId', messageController.getMessageById);

// Mark message as read
router.put('/:messageId/read', messageController.markAsRead);

// Mark multiple messages as read
router.put('/mark-read', messageController.markMultipleAsRead);

// Delete message
router.delete('/:messageId', messageController.deleteMessage);

// Get conversation between two users
router.get('/conversation/:otherUserId', messageController.getConversation);

// Get unread count
router.get('/unread/count', messageController.getUnreadCount);

// Get message statistics
router.get('/stats', messageController.getMessageStats);

module.exports = router;
