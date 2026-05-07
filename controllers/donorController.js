const donorService = require('../services/donorService');
const Joi = require('joi');

const donorController = {
  // Create new donor (worker or owner)
  async createDonor(req, res) {
    try {
      const schema = Joi.object({
        email: Joi.string().email().required(),
        phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
        donorId: Joi.string().required(),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        dateOfBirth: Joi.date().required(),
        gender: Joi.string().valid('male', 'female', 'other').required(),
        bloodType: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-').required(),
        address: Joi.string().required(),
        city: Joi.string().required(),
        state: Joi.string().required(),
        idNumber: Joi.string().required()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      let workerId = null;
      if (req.user.role === 'worker') {
        const worker = await require('../models').Worker.findOne({
          where: { userId: req.user.id }
        });
        workerId = worker.id;
      }

      const result = await donorService.createDonor(
        value,
        workerId,
        req.ip,
        req.get('User-Agent')
      );

      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Update donor
  async updateDonor(req, res) {
    try {
      const { donorId } = req.params;
      
      const schema = Joi.object({
        email: Joi.string().email(),
        phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/),
        firstName: Joi.string(),
        lastName: Joi.string(),
        address: Joi.string(),
        city: Joi.string(),
        state: Joi.string(),
        eligibilityStatus: Joi.string().valid('eligible', 'not_eligible', 'pending')
      }).min(1);

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const donor = await donorService.updateDonor(
        donorId,
        value,
        req.ip,
        req.get('User-Agent')
      );

      res.json(donor);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get donor by ID
  async getDonorById(req, res) {
    try {
      const { donorId } = req.params;

      const donor = await donorService.getDonorById(donorId);
      res.json(donor);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },

  // Get all donors
  async getAllDonors(req, res) {
    try {
      const { page = 1, limit = 10, bloodType, eligibilityStatus, isActive } = req.query;

      const result = await donorService.getAllDonors({
        page: parseInt(page),
        limit: parseInt(limit),
        bloodType,
        eligibilityStatus,
        isActive
      });

      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get donors by blood type
  async getDonorsByBloodType(req, res) {
    try {
      const { bloodType } = req.params;
      const { page = 1, limit = 10, eligibilityStatus } = req.query;

      const result = await donorService.getDonorsByBloodType(bloodType, {
        page: parseInt(page),
        limit: parseInt(limit),
        eligibilityStatus
      });

      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get eligible donors
  async getEligibleDonors(req, res) {
    try {
      const { page = 1, limit = 10, bloodType } = req.query;

      const result = await donorService.getEligibleDonors({
        page: parseInt(page),
        limit: parseInt(limit),
        bloodType
      });

      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Deactivate donor
  async deactivateDonor(req, res) {
    try {
      const { donorId } = req.params;

      const donor = await donorService.deactivateDonor(
        donorId,
        req.ip,
        req.get('User-Agent')
      );

      res.json(donor);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Activate donor
  async activateDonor(req, res) {
    try {
      const { donorId } = req.params;

      const donor = await donorService.activateDonor(
        donorId,
        req.ip,
        req.get('User-Agent')
      );

      res.json(donor);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get donor statistics
  async getDonorStats(req, res) {
    try {
      const stats = await donorService.getDonorStatistics();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = donorController;
