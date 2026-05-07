const inventoryService = require('../services/inventoryService');
const Joi = require('joi');

const inventoryController = {
  // Get all inventory
  async getAllInventory(req, res) {
    try {
      const { page = 1, limit = 10, status, bloodType, expiryFrom, expiryTo } = req.query;

      const result = await inventoryService.getAllInventory({
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        bloodType,
        expiryFrom,
        expiryTo
      });

      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get inventory by blood type
  async getInventoryByBloodType(req, res) {
    try {
      const { bloodType } = req.params;
      const { page = 1, limit = 10, status } = req.query;

      const result = await inventoryService.getInventoryByBloodType(bloodType, {
        page: parseInt(page),
        limit: parseInt(limit),
        status
      });

      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get inventory item by ID
  async getInventoryById(req, res) {
    try {
      const { inventoryId } = req.params;

      const inventory = await inventoryService.getInventoryById(inventoryId);
      res.json(inventory);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },

  // Update inventory status
  async updateInventoryStatus(req, res) {
    try {
      const { inventoryId } = req.params;
      
      const schema = Joi.object({
        status: Joi.string().valid('available', 'expired', 'discarded', 'used', 'quarantined').required(),
        reason: Joi.string().allow(null, '')
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const worker = await require('../models').Worker.findOne({
        where: { userId: req.user.id }
      });

      if (!worker) {
        return res.status(403).json({ error: 'Worker profile not found' });
      }

      const inventory = await inventoryService.updateInventoryStatus(
        inventoryId,
        value.status,
        worker.id,
        req.ip,
        req.get('User-Agent'),
        value.reason
      );

      res.json(inventory);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Use blood
  async useBlood(req, res) {
    try {
      const { inventoryId } = req.params;
      
      const schema = Joi.object({
        useFor: Joi.string().required()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const worker = await require('../models').Worker.findOne({
        where: { userId: req.user.id }
      });

      if (!worker) {
        return res.status(403).json({ error: 'Worker profile not found' });
      }

      const inventory = await inventoryService.useBlood(
        inventoryId,
        value.useFor,
        worker.id,
        req.ip,
        req.get('User-Agent')
      );

      res.json(inventory);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Discard blood
  async discardBlood(req, res) {
    try {
      const { inventoryId } = req.params;
      
      const schema = Joi.object({
        reason: Joi.string().required()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const worker = await require('../models').Worker.findOne({
        where: { userId: req.user.id }
      });

      if (!worker) {
        return res.status(403).json({ error: 'Worker profile not found' });
      }

      const inventory = await inventoryService.discardBlood(
        inventoryId,
        value.reason,
        worker.id,
        req.ip,
        req.get('User-Agent')
      );

      res.json(inventory);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Check and mark expired blood
  async checkExpiredBlood(req, res) {
    try {
      const result = await inventoryService.checkAndMarkExpiredBlood();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get expiring soon blood
  async getExpiringSoon(req, res) {
    try {
      const { days = 7 } = req.query;

      const expiringSoon = await inventoryService.getExpiringSoon(parseInt(days));
      res.json(expiringSoon);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get inventory statistics
  async getInventoryStats(req, res) {
    try {
      const stats = await inventoryService.getInventoryStatistics();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = inventoryController;
