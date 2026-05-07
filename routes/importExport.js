const express = require('express');
const router = express.Router();
const { importExportController, uploadMiddleware } = require('../controllers/importExportController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// All import/export routes require authentication and owner role
router.use(authMiddleware);
router.use(roleMiddleware.owner);

// Export routes
router.get('/donors', importExportController.exportDonors);
router.get('/donations', importExportController.exportDonations);
router.get('/inventory', importExportController.exportInventory);
router.get('/blood-tests', importExportController.exportBloodTests);

// Import routes
router.post('/donors', uploadMiddleware, importExportController.importDonors);

// Export history and file management
router.get('/history', importExportController.getExportHistory);
router.get('/download/:filename', importExportController.downloadExportFile);
router.delete('/files/:filename', importExportController.deleteExportFile);

module.exports = router;
