const { Inventory, Donation, Notification, AuditLog } = require('../models');
const authService = require('./authService');
const moment = require('moment');

class InventoryService {
  async getInventoryByBloodType(bloodType, options = {}) {
    try {
      const { page = 1, limit = 10, status } = options;
      const offset = (page - 1) * limit;

      const whereClause = { bloodType };
      if (status) {
        whereClause.status = status;
      }

      const { count, rows } = await Inventory.findAndCountAll({
        where: whereClause,
        include: [
          { model: Donation, as: 'donation', include: [{ model: require('../models').Donor, as: 'donor', attributes: ['firstName', 'lastName', 'donorId'] }] }
        ],
        order: [['collectionDate', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      return {
        inventory: rows,
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

  async getAllInventory(options = {}) {
    try {
      const { page = 1, limit = 10, status, bloodType, expiryFrom, expiryTo } = options;
      const offset = (page - 1) * limit;

      const whereClause = {};
      if (status) {
        whereClause.status = status;
      }
      if (bloodType) {
        whereClause.bloodType = bloodType;
      }
      if (expiryFrom || expiryTo) {
        whereClause.expiryDate = {};
        if (expiryFrom) whereClause.expiryDate[require('sequelize').Op.gte] = new Date(expiryFrom);
        if (expiryTo) whereClause.expiryDate[require('sequelize').Op.lte] = new Date(expiryTo);
      }

      const { count, rows } = await Inventory.findAndCountAll({
        where: whereClause,
        include: [
          { model: Donation, as: 'donation', include: [{ model: require('../models').Donor, as: 'donor', attributes: ['firstName', 'lastName', 'donorId'] }] }
        ],
        order: [['collectionDate', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      return {
        inventory: rows,
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

  async getInventoryById(inventoryId) {
    try {
      const inventory = await Inventory.findByPk(inventoryId, {
        include: [
          { model: Donation, as: 'donation', include: [{ model: require('../models').Donor, as: 'donor' }] }
        ]
      });

      if (!inventory) {
        throw new Error('Inventory item not found');
      }

      return inventory;
    } catch (error) {
      throw error;
    }
  }

  async updateInventoryStatus(inventoryId, newStatus, workerId, ipAddress, userAgent, reason = null) {
    try {
      const inventory = await Inventory.findByPk(inventoryId);
      if (!inventory) {
        throw new Error('Inventory item not found');
      }

      const oldStatus = inventory.status;
      inventory.status = newStatus;

      if (newStatus === 'discarded' && reason) {
        inventory.discardedReason = reason;
        inventory.discardedByWorkerId = workerId;
      }

      if (newStatus === 'used') {
        inventory.usedDate = new Date();
      }

      await inventory.save();

      await authService.logAudit(
        workerId,
        'INVENTORY_UPDATE',
        'Inventory',
        inventory.id,
        `Inventory status changed from ${oldStatus} to ${newStatus}`,
        ipAddress,
        userAgent,
        { status: oldStatus },
        { status: newStatus }
      );

      return inventory;
    } catch (error) {
      throw error;
    }
  }

  async checkAndMarkExpiredBlood() {
    try {
      const today = moment().startOf('day').toDate();
      
      const expiredInventory = await Inventory.findAll({
        where: {
          status: 'available',
          expiryDate: {
            [require('sequelize').Op.lt]: today
          }
        },
        include: [
          { model: Donation, as: 'donation' }
        ]
      });

      const updatedInventory = [];
      for (const inventory of expiredInventory) {
        inventory.status = 'expired';
        await inventory.save();
        updatedInventory.push(inventory);

        // Create notification for expired blood
        await this.createExpiryNotification(inventory);
      }

      return {
        markedExpired: updatedInventory.length,
        inventory: updatedInventory
      };
    } catch (error) {
      throw error;
    }
  }

  async createExpiryNotification(inventory) {
    try {
      // Find BTD owner to notify
      const { User, BTD } = require('../models');
      const btdOwner = await User.findOne({
        where: { role: 'owner', isActive: true },
        include: [{ model: BTD, as: 'btd' }]
      });

      if (btdOwner) {
        await Notification.create({
          userId: btdOwner.id,
          title: 'Blood Expired',
          message: `${inventory.quantityML}ml of ${inventory.bloodType} blood has expired on ${inventory.expiryDate}. Please remove from inventory.`,
          type: 'blood_expiry',
          priority: 'high',
          actionRequired: true,
          relatedEntityId: inventory.id,
          relatedEntityType: 'Inventory'
        });
      }
    } catch (error) {
      console.error('Failed to create expiry notification:', error);
    }
  }

  async getInventoryStatistics() {
    try {
      const stats = await Inventory.findAll({
        attributes: [
          'bloodType',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'totalUnits'],
          [require('sequelize').fn('SUM', require('sequelize').col('quantityML')), 'totalVolume'],
          [require('sequelize').fn('COUNT', require('sequelize').literal("CASE WHEN status = 'available' THEN 1 END")), 'available'],
          [require('sequelize').fn('COUNT', require('sequelize').literal("CASE WHEN status = 'expired' THEN 1 END")), 'expired'],
          [require('sequelize').fn('COUNT', require('sequelize').literal("CASE WHEN status = 'used' THEN 1 END")), 'used'],
          [require('sequelize').fn('COUNT', require('sequelize').literal("CASE WHEN status = 'discarded' THEN 1 END")), 'discarded']
        ],
        group: ['bloodType']
      });

      const result = stats.map(stat => stat.get({ plain: true }));

      // Get overall stats
      const overallStats = await Inventory.findAll({
        attributes: [
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'totalUnits'],
          [require('sequelize').fn('SUM', require('sequelize').col('quantityML')), 'totalVolume'],
          [require('sequelize').fn('COUNT', require('sequelize').literal("CASE WHEN status = 'available' THEN 1 END")), 'available'],
          [require('sequelize').fn('COUNT', require('sequelize').literal("CASE WHEN status = 'expired' THEN 1 END")), 'expired'],
          [require('sequelize').fn('COUNT', require('sequelize').literal("CASE WHEN status = 'used' THEN 1 END")), 'used'],
          [require('sequelize').fn('COUNT', require('sequelize').literal("CASE WHEN status = 'discarded' THEN 1 END")), 'discarded']
        ]
      });

      const overall = overallStats[0].get({ plain: true });

      return {
        byBloodType: result,
        overall: {
          totalUnits: parseInt(overall.totalUnits) || 0,
          totalVolume: parseInt(overall.totalVolume) || 0,
          available: parseInt(overall.available) || 0,
          expired: parseInt(overall.expired) || 0,
          used: parseInt(overall.used) || 0,
          discarded: parseInt(overall.discarded) || 0
        }
      };
    } catch (error) {
      throw error;
    }
  }

  async getExpiringSoon(days = 7) {
    try {
      const today = moment().startOf('day').toDate();
      const futureDate = moment().add(days, 'days').endOf('day').toDate();

      const expiringSoon = await Inventory.findAll({
        where: {
          status: 'available',
          expiryDate: {
            [require('sequelize').Op.between]: [today, futureDate]
          }
        },
        include: [
          { model: Donation, as: 'donation', include: [{ model: require('../models').Donor, as: 'donor', attributes: ['firstName', 'lastName', 'donorId'] }] }
        ],
        order: [['expiryDate', 'ASC']]
      });

      return expiringSoon;
    } catch (error) {
      throw error;
    }
  }

  async useBlood(inventoryId, useFor, workerId, ipAddress, userAgent) {
    try {
      const inventory = await Inventory.findByPk(inventoryId);
      if (!inventory) {
        throw new Error('Inventory item not found');
      }

      if (inventory.status !== 'available') {
        throw new Error('Blood is not available for use');
      }

      if (moment(inventory.expiryDate).isBefore(moment())) {
        throw new Error('Blood has expired and cannot be used');
      }

      const oldStatus = inventory.status;
      inventory.status = 'used';
      inventory.usedDate = new Date();
      inventory.usedFor = useFor;

      await inventory.save();

      await authService.logAudit(
        workerId,
        'INVENTORY_UPDATE',
        'Inventory',
        inventory.id,
        `Blood used for: ${useFor}`,
        ipAddress,
        userAgent,
        { status: oldStatus },
        { status: 'used', usedFor: useFor }
      );

      return inventory;
    } catch (error) {
      throw error;
    }
  }

  async discardBlood(inventoryId, reason, workerId, ipAddress, userAgent) {
    try {
      const inventory = await Inventory.findByPk(inventoryId);
      if (!inventory) {
        throw new Error('Inventory item not found');
      }

      if (inventory.status === 'used') {
        throw new Error('Blood has already been used and cannot be discarded');
      }

      const oldStatus = inventory.status;
      inventory.status = 'discarded';
      inventory.discardedReason = reason;
      inventory.discardedByWorkerId = workerId;

      await inventory.save();

      await authService.logAudit(
        workerId,
        'INVENTORY_UPDATE',
        'Inventory',
        inventory.id,
        `Blood discarded: ${reason}`,
        ipAddress,
        userAgent,
        { status: oldStatus },
        { status: 'discarded', discardedReason: reason }
      );

      return inventory;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new InventoryService();
