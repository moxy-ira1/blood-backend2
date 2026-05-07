const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// All user routes require authentication
router.use(authMiddleware);

// Create user (owner only)
router.post('/', roleMiddleware.owner, userController.createUser);

// Get all users (owner only)
router.get('/', roleMiddleware.owner, userController.getAllUsers);

// Get user statistics (owner only)
router.get('/stats', roleMiddleware.owner, userController.getUserStats);

// Get user by ID (owner only)
router.get('/:userId', roleMiddleware.owner, userController.getUserById);

// Update user (owner only)
router.put('/:userId', roleMiddleware.owner, userController.updateUser);

// Deactivate user (owner only)
router.put('/:userId/deactivate', roleMiddleware.owner, userController.deactivateUser);

// Activate user (owner only)
router.put('/:userId/activate', roleMiddleware.owner, userController.activateUser);

module.exports = router;
