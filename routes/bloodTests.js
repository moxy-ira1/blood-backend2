const express = require('express');
const router = express.Router();
const bloodTestController = require('../controllers/bloodTestController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Worker routes
router.post('/', authMiddleware, roleMiddleware.worker, bloodTestController.createBloodTest);
router.put('/:testId', authMiddleware, roleMiddleware.worker, bloodTestController.updateBloodTest);
router.post('/:testId/complete', authMiddleware, roleMiddleware.worker, bloodTestController.completeBloodTest);

// Get blood test by ID (all authenticated users)
router.get('/:testId', authMiddleware, roleMiddleware.any, bloodTestController.getBloodTestById);

// Get blood tests by donor (all authenticated users)
router.get('/donor/:donorId', authMiddleware, roleMiddleware.any, bloodTestController.getBloodTestsByDonor);

// Owner/Worker routes for management
router.get('/all/stats', authMiddleware, roleMiddleware.ownerOrWorker, bloodTestController.getBloodTestStats);
router.get('/all', authMiddleware, roleMiddleware.ownerOrWorker, bloodTestController.getAllBloodTests);

module.exports = router;
