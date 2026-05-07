const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Get inventory by ID (all authenticated users)
router.get('/:inventoryId', authMiddleware, roleMiddleware.any, inventoryController.getInventoryById);

// Get inventory by blood type (all authenticated users)
router.get('/blood-type/:bloodType', authMiddleware, roleMiddleware.any, inventoryController.getInventoryByBloodType);

// Owner/Worker routes for management
router.get('/', authMiddleware, roleMiddleware.ownerOrWorker, inventoryController.getAllInventory);
router.get('/stats', authMiddleware, roleMiddleware.ownerOrWorker, inventoryController.getInventoryStats);
router.get('/expiring-soon', authMiddleware, roleMiddleware.ownerOrWorker, inventoryController.getExpiringSoon);
router.post('/check-expired', authMiddleware, roleMiddleware.ownerOrWorker, inventoryController.checkExpiredBlood);

// Worker routes for inventory operations
router.put('/:inventoryId/status', authMiddleware, roleMiddleware.worker, inventoryController.updateInventoryStatus);
router.post('/:inventoryId/use', authMiddleware, roleMiddleware.worker, inventoryController.useBlood);
router.post('/:inventoryId/discard', authMiddleware, roleMiddleware.worker, inventoryController.discardBlood);

module.exports = router;
