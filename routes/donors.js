const express = require('express');
const router = express.Router();
const donorController = require('../controllers/donorController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// All donor routes require authentication
router.use(authMiddleware);

// Create donor (owner or worker)
router.post('/', roleMiddleware.ownerOrWorker, donorController.createDonor);

// Get all donors (owner or worker)
router.get('/', roleMiddleware.ownerOrWorker, donorController.getAllDonors);

// Get donor statistics (owner or worker)
router.get('/stats', roleMiddleware.ownerOrWorker, donorController.getDonorStats);

// Get eligible donors (owner or worker)
router.get('/eligible', roleMiddleware.ownerOrWorker, donorController.getEligibleDonors);

// Get donors by blood type (owner or worker)
router.get('/blood-type/:bloodType', roleMiddleware.ownerOrWorker, donorController.getDonorsByBloodType);

// Get donor by ID (all authenticated users)
router.get('/:donorId', roleMiddleware.any, donorController.getDonorById);

// Update donor (owner or worker)
router.put('/:donorId', roleMiddleware.ownerOrWorker, donorController.updateDonor);

// Deactivate donor (owner only)
router.put('/:donorId/deactivate', roleMiddleware.owner, donorController.deactivateDonor);

// Activate donor (owner only)
router.put('/:donorId/activate', roleMiddleware.owner, donorController.activateDonor);

module.exports = router;
