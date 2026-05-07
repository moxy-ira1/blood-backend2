const express = require('express');
const router = express.Router();
const workerController = require('../controllers/workerController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// All worker routes require authentication
router.use(authMiddleware);

// Create worker (owner only)
router.post('/', roleMiddleware.owner, workerController.createWorker);

// Get all workers (owner only)
router.get('/', roleMiddleware.owner, workerController.getAllWorkers);

// Get worker statistics (owner only)
router.get('/stats', roleMiddleware.owner, workerController.getWorkerStats);

// Get workers by BTD (owner only)
router.get('/btd/:btdId', roleMiddleware.owner, workerController.getWorkersByBTD);

// Get worker by ID (owner or worker themselves)
router.get('/:workerId', roleMiddleware.owner, workerController.getWorkerById);

// Update worker (owner only)
router.put('/:workerId', roleMiddleware.owner, workerController.updateWorker);

// Deactivate worker (owner only)
router.put('/:workerId/deactivate', roleMiddleware.owner, workerController.deactivateWorker);

// Activate worker (owner only)
router.put('/:workerId/activate', roleMiddleware.owner, workerController.activateWorker);

// Delete worker (owner only)
router.delete('/:workerId', roleMiddleware.owner, workerController.deleteWorker);

module.exports = router;
