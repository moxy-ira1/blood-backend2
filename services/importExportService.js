const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');
const path = require('path');
const { 
  Donor, 
  Worker, 
  BloodTest, 
  Donation, 
  Inventory, 
  User, 
  BTD,
  Notification,
  Message,
  AuditLog
} = require('../models');
const authService = require('./authService');

class ImportExportService {
  async exportDonors(options = {}) {
    try {
      const { bloodType, eligibilityStatus, isActive } = options;
      
      const whereClause = {};
      if (bloodType) whereClause.bloodType = bloodType;
      if (eligibilityStatus) whereClause.eligibilityStatus = eligibilityStatus;
      if (isActive !== undefined) whereClause.isActive = isActive === 'true';

      const donors = await Donor.findAll({
        where: whereClause,
        include: [
          { model: User, as: 'user', attributes: ['email', 'phone'] },
          { model: AuthMethod, as: 'authMethod' }
        ],
        order: [['createdAt', 'DESC']]
      });

      const csvData = donors.map(donor => ({
        donorId: donor.donorId,
        firstName: donor.firstName,
        lastName: donor.lastName,
        email: donor.user?.email || '',
        phone: donor.user?.phone || '',
        dateOfBirth: donor.dateOfBirth,
        gender: donor.gender,
        bloodType: donor.bloodType,
        address: donor.address,
        city: donor.city,
        state: donor.state,
        idNumber: donor.idNumber,
        eligibilityStatus: donor.eligibilityStatus,
        lastDonationDate: donor.lastDonationDate,
        totalDonations: donor.totalDonations,
        isActive: donor.isActive,
        createdAt: donor.createdAt
      }));

      return csvData;
    } catch (error) {
      throw error;
    }
  }

  async exportDonations(options = {}) {
    try {
      const { bloodType, status, dateFrom, dateTo } = options;
      
      const whereClause = {};
      if (bloodType) whereClause.bloodType = bloodType;
      if (status) whereClause.donationStatus = status;
      if (dateFrom || dateTo) {
        whereClause.donationDate = {};
        if (dateFrom) whereClause.donationDate[require('sequelize').Op.gte] = new Date(dateFrom);
        if (dateTo) whereClause.donationDate[require('sequelize').Op.lte] = new Date(dateTo);
      }

      const donations = await Donation.findAll({
        where: whereClause,
        include: [
          { model: Donor, as: 'donor', attributes: ['firstName', 'lastName', 'donorId'] },
          { model: Worker, as: 'collectedByWorker', include: [{ model: User, as: 'user', attributes: ['email'] }] }
        ],
        order: [['donationDate', 'DESC']]
      });

      const csvData = donations.map(donation => ({
        donationId: donation.id,
        donorId: donation.donor?.donorId || '',
        donorName: donation.donor ? `${donation.donor.firstName} ${donation.donor.lastName}` : '',
        bloodType: donation.bloodType,
        quantityML: donation.quantityML,
        donationType: donation.donationType,
        donationDate: donation.donationDate,
        donationStatus: donation.donationStatus,
        collectedBy: donation.collectedByWorker?.user?.email || '',
        hemoglobinLevel: donation.hemoglobinLevel,
        bloodPressure: donation.bloodPressure ? `${donation.bloodPressure.systolic}/${donation.bloodPressure.diastolic}` : '',
        pulse: donation.pulse,
        temperature: donation.temperature,
        weight: donation.weight,
        createdAt: donation.createdAt
      }));

      return csvData;
    } catch (error) {
      throw error;
    }
  }

  async exportInventory(options = {}) {
    try {
      const { bloodType, status, expiryFrom, expiryTo } = options;
      
      const whereClause = {};
      if (bloodType) whereClause.bloodType = bloodType;
      if (status) whereClause.status = status;
      if (expiryFrom || expiryTo) {
        whereClause.expiryDate = {};
        if (expiryFrom) whereClause.expiryDate[require('sequelize').Op.gte] = new Date(expiryFrom);
        if (expiryTo) whereClause.expiryDate[require('sequelize').Op.lte] = new Date(expiryTo);
      }

      const inventory = await Inventory.findAll({
        where: whereClause,
        include: [
          { model: Donation, as: 'donation', include: [{ model: Donor, as: 'donor', attributes: ['firstName', 'lastName', 'donorId'] }] }
        ],
        order: [['collectionDate', 'DESC']]
      });

      const csvData = inventory.map(item => ({
        inventoryId: item.id,
        bloodType: item.bloodType,
        quantityML: item.quantityML,
        collectionDate: item.collectionDate,
        expiryDate: item.expiryDate,
        status: item.status,
        donorId: item.donation?.donor?.donorId || '',
        donorName: item.donation?.donor ? `${item.donation.donor.firstName} ${item.donation.donor.lastName}` : '',
        storageLocation: item.storageLocation || '',
        storageTemperature: item.storageTemperature || '',
        batchNumber: item.batchNumber || '',
        usedDate: item.usedDate || '',
        usedFor: item.usedFor || '',
        discardedReason: item.discardedReason || '',
        createdAt: item.createdAt
      }));

      return csvData;
    } catch (error) {
      throw error;
    }
  }

  async exportBloodTests(options = {}) {
    try {
      const { overallResult, dateFrom, dateTo } = options;
      
      const whereClause = {};
      if (overallResult) whereClause.overallResult = overallResult;
      if (dateFrom || dateTo) {
        whereClause.testDate = {};
        if (dateFrom) whereClause.testDate[require('sequelize').Op.gte] = new Date(dateFrom);
        if (dateTo) whereClause.testDate[require('sequelize').Op.lte] = new Date(dateTo);
      }

      const bloodTests = await BloodTest.findAll({
        where: whereClause,
        include: [
          { model: Donor, as: 'donor', attributes: ['firstName', 'lastName', 'donorId', 'bloodType'] },
          { model: Worker, as: 'testedByWorker', include: [{ model: User, as: 'user', attributes: ['email'] }] }
        ],
        order: [['testDate', 'DESC']]
      });

      const csvData = bloodTests.map(test => ({
        testId: test.id,
        donorId: test.donor?.donorId || '',
        donorName: test.donor ? `${test.donor.firstName} ${test.donor.lastName}` : '',
        donorBloodType: test.donor?.bloodType || '',
        testDate: test.testDate,
        hivResult: test.hivResult,
        hepatitisBResult: test.hepatitisBResult,
        hepatitisCResult: test.hepatitisCResult,
        malariaResult: test.malariaResult,
        hemoglobinLevel: test.hemoglobinLevel || '',
        overallResult: test.overallResult,
        testedBy: test.testedByWorker?.user?.email || '',
        testNotes: test.testNotes || '',
        isCompleted: test.isCompleted,
        createdAt: test.createdAt
      }));

      return csvData;
    } catch (error) {
      throw error;
    }
  }

  async importDonors(filePath, userId, ipAddress, userAgent) {
    try {
      const results = [];
      const errors = [];

      return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', async (row) => {
            try {
              // Validate required fields
              if (!row.donorId || !row.firstName || !row.lastName || !row.dateOfBirth || 
                  !row.gender || !row.bloodType || !row.address || !row.city || !row.state || !row.idNumber) {
                errors.push({ row, error: 'Missing required fields' });
                return;
              }

              // Check if donor already exists
              const existingDonor = await Donor.findOne({
                where: { 
                  [require('sequelize').Op.or]: [
                    { donorId: row.donorId },
                    { idNumber: row.idNumber }
                  ]
                }
              });

              if (existingDonor) {
                errors.push({ row, error: 'Donor already exists' });
                return;
              }

              // Create user account
              const user = await User.create({
                email: row.email || null,
                phone: row.phone || null,
                role: 'donor'
              });

              // Create donor profile
              const donor = await Donor.create({
                userId: user.id,
                donorId: row.donorId,
                firstName: row.firstName,
                lastName: row.lastName,
                dateOfBirth: row.dateOfBirth,
                gender: row.gender,
                bloodType: row.bloodType,
                address: row.address,
                city: row.city,
                state: row.state,
                idNumber: row.idNumber,
                eligibilityStatus: row.eligibilityStatus || 'pending',
                totalDonations: parseInt(row.totalDonations) || 0,
                isActive: row.isActive === 'true' || row.isActive === true
              });

              // Create auth method
              if (row.idNumber) {
                await AuthMethod.create({
                  donorId: donor.id,
                  method: 'id_number',
                  identifier: row.idNumber
                });
              }

              results.push({ donorId: donor.id, status: 'success' });

              await authService.logAudit(
                userId,
                'IMPORT_DONOR',
                'Donor',
                donor.id,
                `Donor imported: ${row.firstName} ${row.lastName}`,
                ipAddress,
                userAgent
              );

            } catch (error) {
              errors.push({ row, error: error.message });
            }
          })
          .on('end', () => {
            resolve({ results, errors });
          })
          .on('error', (error) => {
            reject(error);
          });
      });
    } catch (error) {
      throw error;
    }
  }

  async generateCsvFile(data, filename) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fullFilename = `${filename}_${timestamp}.csv`;
      const filePath = path.join(__dirname, '../exports', fullFilename);

      // Ensure exports directory exists
      const exportsDir = path.dirname(filePath);
      if (!fs.existsSync(exportsDir)) {
        fs.mkdirSync(exportsDir, { recursive: true });
      }

      if (data.length === 0) {
        throw new Error('No data to export');
      }

      const headers = Object.keys(data[0]).map(key => ({ id: key, title: key }));
      
      const csvWriter = createCsvWriter({
        path: filePath,
        header: headers
      });

      await csvWriter.writeRecords(data);

      return { filePath, filename: fullFilename };
    } catch (error) {
      throw error;
    }
  }

  async getExportHistory(userId) {
    try {
      const exportsDir = path.join(__dirname, '../exports');
      
      if (!fs.existsSync(exportsDir)) {
        return { files: [] };
      }

      const files = fs.readdirSync(exportsDir)
        .filter(file => file.endsWith('.csv'))
        .map(file => {
          const filePath = path.join(exportsDir, file);
          const stats = fs.statSync(filePath);
          
          return {
            filename: file,
            path: filePath,
            size: stats.size,
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime
          };
        })
        .sort((a, b) => b.createdAt - a.createdAt);

      return { files };
    } catch (error) {
      throw error;
    }
  }

  async deleteExportFile(filename) {
    try {
      const filePath = path.join(__dirname, '../exports', filename);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return { message: 'File deleted successfully' };
      } else {
        throw new Error('File not found');
      }
    } catch (error) {
      throw error;
    }
  }

  async validateImportFile(file) {
    try {
      const allowedMimeTypes = ['text/csv', 'application/csv'];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new Error('Invalid file type. Only CSV files are allowed.');
      }

      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error('File size too large. Maximum size is 10MB.');
      }

      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ImportExportService();
