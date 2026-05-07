const { Donation, Donor, Worker, Inventory, Notification, AuditLog } = require('../models');
const authService = require('./authService');
const moment = require('moment');

class DonationService {
  async createDonation(donationData, workerId, ipAddress, userAgent) {
    try {
      const { donorId, ...donationFields } = donationData;

      // Validate donor exists and is eligible
      const donor = await Donor.findByPk(donorId);
      if (!donor) {
        throw new Error('Donor not found');
      }

      if (donor.eligibilityStatus !== 'eligible') {
        throw new Error('Donor is not eligible for donation');
      }

      // Check 56-day rule
      await this.validateDonationCooldown(donor);

      // Create donation record
      const donation = await Donation.create({
        donorId,
        bloodType: donor.bloodType,
        collectedByWorkerId: workerId,
        isEligibleBeforeDonation: true,
        ...donationFields
      });

      // Update donor information
      await this.updateDonorAfterDonation(donor, donation);

      // Add blood to inventory
      await this.addToInventory(donation);

      // Create notification for donor
      await this.createDonationSuccessNotification(donor, donation);

      // Log audit
      await authService.logAudit(
        workerId,
        'CREATE_DONATION',
        'Donation',
        donation.id,
        `Donation created for donor ${donorId}`,
        ipAddress,
        userAgent,
        null,
        donation.toJSON()
      );

      return donation;
    } catch (error) {
      throw error;
    }
  }

  async validateDonationCooldown(donor) {
    const cooldownDays = parseInt(process.env.DONATION_COOLDOWN_DAYS) || 56;
    
    if (donor.lastDonationDate) {
      const lastDonation = moment(donor.lastDonationDate);
      const today = moment();
      const daysSinceLastDonation = today.diff(lastDonation, 'days');

      if (daysSinceLastDonation < cooldownDays) {
        const remainingDays = cooldownDays - daysSinceLastDonation;
        throw new Error(`Donor must wait ${remainingDays} more days before next donation (56-day rule)`);
      }
    }

    return true;
  }

  async updateDonorAfterDonation(donor, donation) {
    try {
      donor.lastDonationDate = donation.donationDate;
      donor.eligibilityStatus = 'not_eligible'; // Temporarily not eligible
      donor.totalDonations += 1;
      await donor.save();
    } catch (error) {
      console.error('Failed to update donor after donation:', error);
      throw error;
    }
  }

  async addToInventory(donation) {
    try {
      await Inventory.create({
        donationId: donation.id,
        bloodType: donation.bloodType,
        quantityML: donation.quantityML,
        collectionDate: donation.donationDate,
        status: 'available'
      });
    } catch (error) {
      console.error('Failed to add blood to inventory:', error);
      throw error;
    }
  }

  async createDonationSuccessNotification(donor, donation) {
    try {
      const title = 'Donation Successful';
      const message = `Thank you for donating blood! Your donation of ${donation.quantityML}ml of ${donation.bloodType} blood has been successfully collected. You have saved lives today!`;

      await Notification.create({
        userId: donor.userId,
        title,
        message,
        type: 'donation_success',
        priority: 'medium',
        relatedEntityId: donation.id,
        relatedEntityType: 'Donation'
      });
    } catch (error) {
      console.error('Failed to create donation notification:', error);
    }
  }

  async getDonationsByDonor(donorId, options = {}) {
    try {
      const { page = 1, limit = 10, status } = options;
      const offset = (page - 1) * limit;

      const whereClause = { donorId };
      if (status) {
        whereClause.donationStatus = status;
      }

      const { count, rows } = await Donation.findAndCountAll({
        where: whereClause,
        include: [
          { model: Donor, as: 'donor', attributes: ['firstName', 'lastName', 'donorId'] },
          { model: Worker, as: 'collectedByWorker', include: [{ model: require('../models').User, as: 'user', attributes: ['email'] }] }
        ],
        order: [['donationDate', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      return {
        donations: rows,
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

  async getDonationById(donationId) {
    try {
      const donation = await Donation.findByPk(donationId, {
        include: [
          { model: Donor, as: 'donor' },
          { model: Worker, as: 'collectedByWorker', include: [{ model: require('../models').User, as: 'user' }] },
          { model: Inventory, as: 'inventory' }
        ]
      });

      if (!donation) {
        throw new Error('Donation not found');
      }

      return donation;
    } catch (error) {
      throw error;
    }
  }

  async getAllDonations(options = {}) {
    try {
      const { page = 1, limit = 10, status, dateFrom, dateTo, bloodType } = options;
      const offset = (page - 1) * limit;

      const whereClause = {};
      if (status) {
        whereClause.donationStatus = status;
      }
      if (bloodType) {
        whereClause.bloodType = bloodType;
      }
      if (dateFrom || dateTo) {
        whereClause.donationDate = {};
        if (dateFrom) whereClause.donationDate[require('sequelize').Op.gte] = new Date(dateFrom);
        if (dateTo) whereClause.donationDate[require('sequelize').Op.lte] = new Date(dateTo);
      }

      const { count, rows } = await Donation.findAndCountAll({
        where: whereClause,
        include: [
          { model: Donor, as: 'donor', attributes: ['firstName', 'lastName', 'donorId', 'bloodType'] },
          { model: Worker, as: 'collectedByWorker', include: [{ model: require('../models').User, as: 'user', attributes: ['email'] }] }
        ],
        order: [['donationDate', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      return {
        donations: rows,
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

  async updateDonationStatus(donationId, newStatus, workerId, ipAddress, userAgent, notes = null) {
    try {
      const donation = await Donation.findByPk(donationId);
      if (!donation) {
        throw new Error('Donation not found');
      }

      const oldStatus = donation.donationStatus;
      donation.donationStatus = newStatus;
      
      if (notes) {
        donation.donationNotes = notes;
      }

      await donation.save();

      // Update inventory status if donation is cancelled
      if (newStatus === 'cancelled') {
        await Inventory.update(
          { status: 'discarded', discardedReason: 'Donation cancelled' },
          { where: { donationId } }
        );
      }

      await authService.logAudit(
        workerId,
        'UPDATE_DONATION',
        'Donation',
        donation.id,
        `Donation status changed from ${oldStatus} to ${newStatus}`,
        ipAddress,
        userAgent,
        { donationStatus: oldStatus },
        { donationStatus: newStatus }
      );

      return donation;
    } catch (error) {
      throw error;
    }
  }

  async checkDonorEligibility(donorId) {
    try {
      const donor = await Donor.findByPk(donorId);
      if (!donor) {
        throw new Error('Donor not found');
      }

      const eligibility = {
        isEligible: donor.eligibilityStatus === 'eligible',
        reasons: []
      };

      if (donor.eligibilityStatus !== 'eligible') {
        eligibility.reasons.push('Donor is marked as not eligible in system');
      }

      // Check 56-day rule
      if (donor.lastDonationDate) {
        const cooldownDays = parseInt(process.env.DONATION_COOLDOWN_DAYS) || 56;
        const lastDonation = moment(donor.lastDonationDate);
        const today = moment();
        const daysSinceLastDonation = today.diff(lastDonation, 'days');

        if (daysSinceLastDonation < cooldownDays) {
          eligibility.isEligible = false;
          eligibility.reasons.push(`Must wait ${cooldownDays - daysSinceLastDonation} more days (56-day rule)`);
          eligibility.nextEligibleDate = lastDonation.add(cooldownDays, 'days').toDate();
        }
      }

      return eligibility;
    } catch (error) {
      throw error;
    }
  }

  async getDonationStatistics(options = {}) {
    try {
      const { dateFrom, dateTo } = options;
      
      const whereClause = {};
      if (dateFrom || dateTo) {
        whereClause.donationDate = {};
        if (dateFrom) whereClause.donationDate[require('sequelize').Op.gte] = new Date(dateFrom);
        if (dateTo) whereClause.donationDate[require('sequelize').Op.lte] = new Date(dateTo);
      }

      const stats = await Donation.findAll({
        where: whereClause,
        attributes: [
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'totalDonations'],
          [require('sequelize').fn('SUM', require('sequelize').col('quantityML')), 'totalVolume'],
          [require('sequelize').fn('COUNT', require('sequelize').literal("CASE WHEN donationStatus = 'completed' THEN 1 END")), 'completed'],
          [require('sequelize').fn('COUNT', require('sequelize').literal("CASE WHEN donationStatus = 'cancelled' THEN 1 END")), 'cancelled'],
          [require('sequelize').fn('COUNT', require('sequelize').literal("CASE WHEN donationStatus = 'deferred' THEN 1 END")), 'deferred']
        ]
      });

      const result = stats[0].get({ plain: true });

      return {
        totalDonations: parseInt(result.totalDonations) || 0,
        totalVolume: parseInt(result.totalVolume) || 0,
        completed: parseInt(result.completed) || 0,
        cancelled: parseInt(result.cancelled) || 0,
        deferred: parseInt(result.deferred) || 0
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new DonationService();
