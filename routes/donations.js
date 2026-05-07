const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Worker routes
router.post('/', authMiddleware, roleMiddleware.worker, donationController.createDonation);
router.put('/:donationId/status', authMiddleware, roleMiddleware.worker, donationController.updateDonationStatus);

// Get donation by ID (all authenticated users)
router.get('/:donationId', authMiddleware, roleMiddleware.any, donationController.getDonationById);

// Get donations by donor (all authenticated users)
router.get('/donor/:donorId', authMiddleware, roleMiddleware.any, donationController.getDonationsByDonor);

// Check donor eligibility (all authenticated users)
router.get('/eligibility/:donorId', authMiddleware, roleMiddleware.any, donationController.checkDonorEligibility);

// Owner/Worker routes for management
router.get('/stats', authMiddleware, roleMiddleware.ownerOrWorker, donationController.getDonationStats);
router.get('/all', authMiddleware, roleMiddleware.ownerOrWorker, donationController.getAllDonations);

module.exports = router;
