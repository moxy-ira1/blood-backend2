const { Donor, User, AuthMethod } = require('../models');
const authService = require('./authService');

class DonorService {
  async createDonor(donorData, workerId, ipAddress, userAgent) {
    try {
      const { email, phone, ...donorFields } = donorData;

      // Create user account for donor
      const user = await User.create({
        email,
        phone,
        role: 'donor'
      });

      // Create donor profile
      const donor = await Donor.create({
        userId: user.id,
        isRegisteredByWorker: !!workerId,
        registeredByWorkerId: workerId,
        ...donorFields
      });

      // Create auth method for ID number login
      if (donorFields.idNumber) {
        await AuthMethod.create({
          donorId: donor.id,
          method: 'id_number',
          identifier: donorFields.idNumber
        });
      }

      await authService.logAudit(
        workerId || user.id,
        'CREATE_DONOR',
        'Donor',
        donor.id,
        `Donor created: ${donorFields.firstName} ${donorFields.lastName}`,
        ipAddress,
        userAgent,
        null,
        donor.toJSON()
      );

      return { user, donor };
    } catch (error) {
      throw error;
    }
  }

  async updateDonor(donorId, updateData, ipAddress, userAgent) {
    try {
      const donor = await Donor.findByPk(donorId, {
        include: [{ model: User, as: 'user' }]
      });

      if (!donor) {
        throw new Error('Donor not found');
      }

      const oldValue = donor.toJSON();
      await donor.update(updateData);

      // Update user email/phone if provided
      if (updateData.email || updateData.phone) {
        const userUpdate = {};
        if (updateData.email) userUpdate.email = updateData.email;
        if (updateData.phone) userUpdate.phone = updateData.phone;
        
        await donor.user.update(userUpdate);
      }

      await authService.logAudit(
        donor.user.id,
        'UPDATE_DONOR',
        'Donor',
        donor.id,
        `Donor updated: ${donor.firstName} ${donor.lastName}`,
        ipAddress,
        userAgent,
        oldValue,
        donor.toJSON()
      );

      return donor;
    } catch (error) {
      throw error;
    }
  }

  async getDonorById(donorId) {
    try {
      const donor = await Donor.findByPk(donorId, {
        include: [
          { model: User, as: 'user', attributes: { exclude: ['password'] } },
          { model: AuthMethod, as: 'authMethod' }
        ]
      });

      if (!donor) {
        throw new Error('Donor not found');
      }

      return donor;
    } catch (error) {
      throw error;
    }
  }

  async getAllDonors(options = {}) {
    try {
      const { page = 1, limit = 10, bloodType, eligibilityStatus, isActive } = options;
      const offset = (page - 1) * limit;

      const whereClause = {};
      if (bloodType) {
        whereClause.bloodType = bloodType;
      }
      if (eligibilityStatus) {
        whereClause.eligibilityStatus = eligibilityStatus;
      }
      if (isActive !== undefined) {
        whereClause.isActive = isActive === 'true';
      }

      const { count, rows } = await Donor.findAndCountAll({
        where: whereClause,
        include: [
          { model: User, as: 'user', attributes: { exclude: ['password'] } },
          { model: AuthMethod, as: 'authMethod' }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      return {
        donors: rows,
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

  async getDonorsByBloodType(bloodType, options = {}) {
    try {
      const { page = 1, limit = 10, eligibilityStatus } = options;
      const offset = (page - 1) * limit;

      const whereClause = { bloodType };
      if (eligibilityStatus) {
        whereClause.eligibilityStatus = eligibilityStatus;
      }

      const { count, rows } = await Donor.findAndCountAll({
        where: whereClause,
        include: [
          { model: User, as: 'user', attributes: { exclude: ['password'] } }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      return {
        donors: rows,
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

  async getEligibleDonors(options = {}) {
    try {
      const { page = 1, limit = 10, bloodType } = options;
      const offset = (page - 1) * limit;

      const whereClause = { eligibilityStatus: 'eligible' };
      if (bloodType) {
        whereClause.bloodType = bloodType;
      }

      const { count, rows } = await Donor.findAndCountAll({
        where: whereClause,
        include: [
          { model: User, as: 'user', attributes: { exclude: ['password'] } }
        ],
        order: [['lastDonationDate', 'ASC'], ['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      return {
        donors: rows,
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

  async deactivateDonor(donorId, ipAddress, userAgent) {
    try {
      const donor = await Donor.findByPk(donorId, {
        include: [{ model: User, as: 'user' }]
      });

      if (!donor) {
        throw new Error('Donor not found');
      }

      const oldValue = donor.toJSON();
      donor.isActive = false;
      await donor.save();

      // Also deactivate user account
      donor.user.isActive = false;
      await donor.user.save();

      await authService.logAudit(
        donor.user.id,
        'UPDATE_DONOR',
        'Donor',
        donor.id,
        `Donor deactivated: ${donor.firstName} ${donor.lastName}`,
        ipAddress,
        userAgent,
        oldValue,
        donor.toJSON()
      );

      return donor;
    } catch (error) {
      throw error;
    }
  }

  async activateDonor(donorId, ipAddress, userAgent) {
    try {
      const donor = await Donor.findByPk(donorId, {
        include: [{ model: User, as: 'user' }]
      });

      if (!donor) {
        throw new Error('Donor not found');
      }

      const oldValue = donor.toJSON();
      donor.isActive = true;
      await donor.save();

      // Also activate user account
      donor.user.isActive = true;
      await donor.user.save();

      await authService.logAudit(
        donor.user.id,
        'UPDATE_DONOR',
        'Donor',
        donor.id,
        `Donor activated: ${donor.firstName} ${donor.lastName}`,
        ipAddress,
        userAgent,
        oldValue,
        donor.toJSON()
      );

      return donor;
    } catch (error) {
      throw error;
    }
  }

  async getDonorStatistics() {
    try {
      const stats = await Donor.findAll({
        attributes: [
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'total'],
          [require('sequelize').fn('COUNT', require('sequelize').literal("CASE WHEN eligibilityStatus = 'eligible' THEN 1 END")), 'eligible'],
          [require('sequelize').fn('COUNT', require('sequelize').literal("CASE WHEN eligibilityStatus = 'not_eligible' THEN 1 END")), 'notEligible'],
          [require('sequelize').fn('COUNT', require('sequelize').literal("CASE WHEN eligibilityStatus = 'pending' THEN 1 END")), 'pending'],
          [require('sequelize').fn('COUNT', require('sequelize').literal("CASE WHEN isActive = true THEN 1 END")), 'active'],
          [require('sequelize').fn('COUNT', require('sequelize').literal("CASE WHEN isActive = false THEN 1 END")), 'inactive'],
          [require('sequelize').fn('COUNT', require('sequelize').literal("CASE WHEN bloodType = 'A+' THEN 1 END")), 'aPositive'],
          [require('sequelize').fn('COUNT', require('sequelize').literal("CASE WHEN bloodType = 'A-' THEN 1 END")), 'aNegative'],
          [require('sequelize').fn('COUNT', require('sequelize').literal("CASE WHEN bloodType = 'B+' THEN 1 END")), 'bPositive'],
          [require('sequelize').fn('COUNT', require('sequelize').literal("CASE WHEN bloodType = 'B-' THEN 1 END")), 'bNegative'],
          [require('sequelize').fn('COUNT', require('sequelize').literal("CASE WHEN bloodType = 'AB+' THEN 1 END")), 'abPositive'],
          [require('sequelize').fn('COUNT', require('sequelize').literal("CASE WHEN bloodType = 'AB-' THEN 1 END")), 'abNegative'],
          [require('sequelize').fn('COUNT', require('sequelize').literal("CASE WHEN bloodType = 'O+' THEN 1 END")), 'oPositive'],
          [require('sequelize').fn('COUNT', require('sequelize').literal("CASE WHEN bloodType = 'O-' THEN 1 END")), 'oNegative']
        ]
      });

      const result = stats[0].get({ plain: true });

      return {
        total: parseInt(result.total) || 0,
        eligible: parseInt(result.eligible) || 0,
        notEligible: parseInt(result.notEligible) || 0,
        pending: parseInt(result.pending) || 0,
        active: parseInt(result.active) || 0,
        inactive: parseInt(result.inactive) || 0,
        byBloodType: {
          'A+': parseInt(result.aPositive) || 0,
          'A-': parseInt(result.aNegative) || 0,
          'B+': parseInt(result.bPositive) || 0,
          'B-': parseInt(result.bNegative) || 0,
          'AB+': parseInt(result.abPositive) || 0,
          'AB-': parseInt(result.abNegative) || 0,
          'O+': parseInt(result.oPositive) || 0,
          'O-': parseInt(result.oNegative) || 0
        }
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new DonorService();
