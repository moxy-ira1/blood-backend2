const importExportService = require('../services/importExportService');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.mimetype === 'application/csv') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  }
});

const importExportController = {
  // Export donors
  async exportDonors(req, res) {
    try {
      const { bloodType, eligibilityStatus, isActive } = req.query;

      const csvData = await importExportService.exportDonors({
        bloodType,
        eligibilityStatus,
        isActive
      });

      const { filePath, filename } = await importExportService.generateCsvFile(csvData, 'donors_export');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.sendFile(filePath, (err) => {
        if (err) {
          console.error('Error sending file:', err);
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Export donations
  async exportDonations(req, res) {
    try {
      const { bloodType, status, dateFrom, dateTo } = req.query;

      const csvData = await importExportService.exportDonations({
        bloodType,
        status,
        dateFrom,
        dateTo
      });

      const { filePath, filename } = await importExportService.generateCsvFile(csvData, 'donations_export');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.sendFile(filePath, (err) => {
        if (err) {
          console.error('Error sending file:', err);
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Export inventory
  async exportInventory(req, res) {
    try {
      const { bloodType, status, expiryFrom, expiryTo } = req.query;

      const csvData = await importExportService.exportInventory({
        bloodType,
        status,
        expiryFrom,
        expiryTo
      });

      const { filePath, filename } = await importExportService.generateCsvFile(csvData, 'inventory_export');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.sendFile(filePath, (err) => {
        if (err) {
          console.error('Error sending file:', err);
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Export blood tests
  async exportBloodTests(req, res) {
    try {
      const { overallResult, dateFrom, dateTo } = req.query;

      const csvData = await importExportService.exportBloodTests({
        overallResult,
        dateFrom,
        dateTo
      });

      const { filePath, filename } = await importExportService.generateCsvFile(csvData, 'blood_tests_export');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.sendFile(filePath, (err) => {
        if (err) {
          console.error('Error sending file:', err);
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Import donors
  async importDonors(req, res) {
    try {
      const result = await importExportService.importDonors(
        req.file.path,
        req.user.id,
        req.ip,
        req.get('User-Agent')
      );

      // Clean up uploaded file
      const fs = require('fs');
      fs.unlinkSync(req.file.path);

      res.json({
        message: 'Import completed',
        imported: result.results.length,
        errors: result.errors.length,
        errors: result.errors
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get export history
  async getExportHistory(req, res) {
    try {
      const history = await importExportService.getExportHistory(req.user.id);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Download export file
  async downloadExportFile(req, res) {
    try {
      const { filename } = req.params;
      const filePath = path.join(__dirname, '../exports', filename);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.sendFile(filePath, (err) => {
        if (err) {
          console.error('Error sending file:', err);
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Delete export file
  async deleteExportFile(req, res) {
    try {
      const { filename } = req.params;

      const result = await importExportService.deleteExportFile(filename);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
};

// Middleware for file upload
const uploadMiddleware = upload.single('file');

module.exports = { importExportController, uploadMiddleware };
