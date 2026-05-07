const { BloodTest, Donor, Worker, Notification, AuditLog } = require('../models');
const authService = require('./authService');
const moment = require('moment');

class BloodTestService {
  async createBloodTest(testData, workerId, ipAddress, userAgent) {
    try {
      const { donorId, ...testFields } = testData;

      // Verify donor exists
      const donor = await Donor.findByPk(donorId);
      if (!donor) {
        throw new Error('Donor not found');
      }

      // Create blood test
      const bloodTest = await BloodTest.create({
        donorId,
        testedByWorkerId: workerId,
        ...testFields
      });

      await authService.logAudit(
        workerId,
        'CREATE_BLOOD_TEST',
        'BloodTest',
        bloodTest.id,
        `Blood test created for donor ${donorId}`,
        ipAddress,
        userAgent,
        null,
        bloodTest.toJSON()
      );

      return bloodTest;
    } catch (error) {
      throw error;
    }
  }

  async updateBloodTest(testId, updateData, workerId, ipAddress, userAgent) {
    try {
      const bloodTest = await BloodTest.findByPk(testId, {
        include: [{ model: Donor, as: 'donor' }]
      });

      if (!bloodTest) {
        throw new Error('Blood test not found');
      }

      const oldValue = bloodTest.toJSON();
      await bloodTest.update(updateData);

      // Check if test is completed and update eligibility
      if (this.isTestComplete(bloodTest)) {
        await this.evaluateDonorEligibility(bloodTest, workerId, ipAddress, userAgent);
      }

      await authService.logAudit(
        workerId,
        'UPDATE_BLOOD_TEST',
        'BloodTest',
        bloodTest.id,
        `Blood test ${testId} updated`,
        ipAddress,
        userAgent,
        oldValue,
        bloodTest.toJSON()
      );

      return bloodTest;
    } catch (error) {
      throw error;
    }
  }

  async completeBloodTest(testId, workerId, ipAddress, userAgent) {
    try {
      const bloodTest = await BloodTest.findByPk(testId, {
        include: [{ model: Donor, as: 'donor' }]
      });

      if (!bloodTest) {
        throw new Error('Blood test not found');
      }

      if (!this.isTestComplete(bloodTest)) {
        throw new Error('Blood test is not complete. All test results must be provided.');
      }

      bloodTest.isCompleted = true;
      bloodTest.testDate = new Date();
      await bloodTest.save();

      await this.evaluateDonorEligibility(bloodTest, workerId, ipAddress, userAgent);

      await authService.logAudit(
        workerId,
        'COMPLETE_BLOOD_TEST',
        'BloodTest',
        bloodTest.id,
        `Blood test ${testId} completed for donor ${bloodTest.donorId}`,
        ipAddress,
        userAgent
      );

      return bloodTest;
    } catch (error) {
      throw error;
    }
  }

  async evaluateDonorEligibility(bloodTest, workerId, ipAddress, userAgent) {
    try {
      const donor = bloodTest.donor;
      const hemoglobinThreshold = parseFloat(process.env.HEMOGLOBIN_THRESHOLD) || 12.5;

      let isEligible = true;
      let reasons = [];

      // Check for positive test results
      if (bloodTest.hivResult === 'positive') {
        isEligible = false;
        reasons.push('HIV positive');
      }

      if (bloodTest.hepatitisBResult === 'positive') {
        isEligible = false;
        reasons.push('Hepatitis B positive');
      }

      if (bloodTest.hepatitisCResult === 'positive') {
        isEligible = false;
        reasons.push('Hepatitis C positive');
      }

      if (bloodTest.malariaResult === 'positive') {
        isEligible = false;
        reasons.push('Malaria positive');
      }

      // Check hemoglobin level
      if (bloodTest.hemoglobinLevel && bloodTest.hemoglobinLevel < hemoglobinThreshold) {
        isEligible = false;
        reasons.push(`Hemoglobin level too low (${bloodTest.hemoglobinLevel} g/dL)`);
      }

      // Update blood test overall result
      bloodTest.overallResult = isEligible ? 'eligible' : 'not_eligible';
      await bloodTest.save();

      // Update donor eligibility status
      const oldEligibility = donor.eligibilityStatus;
      donor.eligibilityStatus = isEligible ? 'eligible' : 'not_eligible';
      await donor.save();

      // Create notification for donor
      await this.createBloodTestNotification(donor, bloodTest, isEligible, reasons);

      // Log eligibility change
      if (oldEligibility !== donor.eligibilityStatus) {
        await authService.logAudit(
          workerId,
          'UPDATE_DONOR',
          'Donor',
          donor.id,
          `Donor eligibility changed from ${oldEligibility} to ${donor.eligibilityStatus}`,
          ipAddress,
          userAgent,
          { eligibilityStatus: oldEligibility },
          { eligibilityStatus: donor.eligibilityStatus }
        );
      }

      return { isEligible, reasons };
    } catch (error) {
      throw error;
    }
  }

  async createBloodTestNotification(donor, bloodTest, isEligible, reasons) {
    try {
      const title = isEligible ? 'Blood Test Results - Eligible' : 'Blood Test Results - Not Eligible';
      const message = isEligible 
        ? `Your recent blood test results show you are eligible to donate blood. Thank you for your commitment to saving lives!`
        : `Your recent blood test results show you are currently not eligible to donate blood. Reasons: ${reasons.join(', ')}. Please consult with healthcare staff for more information.`;

      await Notification.create({
        userId: donor.userId,
        title,
        message,
        type: 'blood_test_result',
        priority: isEligible ? 'medium' : 'high',
        actionRequired: !isEligible,
        relatedEntityId: bloodTest.id,
        relatedEntityType: 'BloodTest'
      });
    } catch (error) {
      console.error('Failed to create blood test notification:', error);
    }
  }

  isTestComplete(bloodTest) {
    const requiredFields = [
      'hivResult',
      'hepatitisBResult', 
      'hepatitisCResult',
      'malariaResult',
      'hemoglobinLevel'
    ];

    return requiredFields.every(field => {
      const value = bloodTest[field];
      if (field === 'hemoglobinLevel') {
        return value !== null && value !== undefined;
      }
      return value && value !== 'pending';
    });
  }

  async getBloodTestsByDonor(donorId, options = {}) {
    try {
      const { page = 1, limit = 10, status } = options;
      const offset = (page - 1) * limit;

      const whereClause = { donorId };
      if (status) {
        whereClause.overallResult = status;
      }

      const { count, rows } = await BloodTest.findAndCountAll({
        where: whereClause,
        include: [
          { model: Donor, as: 'donor', attributes: ['firstName', 'lastName', 'donorId'] },
          { model: Worker, as: 'testedByWorker', include: [{ model: require('../models').User, as: 'user', attributes: ['email'] }] }
        ],
        order: [['testDate', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      return {
        bloodTests: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  async getBloodTestById(testId) {
    try {
      const bloodTest = await BloodTest.findByPk(testId, {
        include: [
          { model: Donor, as: 'donor' },
          { model: Worker, as: 'testedByWorker', include: [{ model: require('../models').User, as: 'user' }] }
        ]
      });

      if (!bloodTest) {
        throw new Error('Blood test not found');
      }

      return bloodTest;
    } catch (error) {
      throw error;
    }
  }

  async getAllBloodTests(options = {}) {
    try {
      const { page = 1, limit = 10, status, dateFrom, dateTo } = options;
      const offset = (page - 1) * limit;

      const whereClause = {};
      if (status) {
        whereClause.overallResult = status;
      }
      if (dateFrom || dateTo) {
        whereClause.testDate = {};
        if (dateFrom) whereClause.testDate[sequelize.Op.gte] = new Date(dateFrom);
        if (dateTo) whereClause.testDate[sequelize.Op.lte] = new Date(dateTo);
      }

      const { count, rows } = await BloodTest.findAndCountAll({
        where: whereClause,
        include: [
          { model: Donor, as: 'donor', attributes: ['firstName', 'lastName', 'donorId', 'bloodType'] },
          { model: Worker, as: 'testedByWorker', include: [{ model: require('../models').User, as: 'user', attributes: ['email'] }] }
        ],
        order: [['testDate', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      return {
        bloodTests: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new BloodTestService();
