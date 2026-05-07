const donationService = require('../services/donationService');
const Joi = require('joi');

const donationController = {
  // Create new donation
  async createDonation(req, res) {
    try {
      const schema = Joi.object({
        donorId: Joi.string().uuid().required(),
        quantityML: Joi.number().integer().min(250).max(550).default(450),
        donationType: Joi.string().valid('whole_blood', 'plasma', 'platelets', 'red_blood_cells').default('whole_blood'),
        bloodPressure: Joi.object({
          systolic: Joi.number().integer().min(70).max(250),
          diastolic: Joi.number().integer().min(40).max(150)
        }).allow(null),
        pulse: Joi.number().integer().min(40).max(200).allow(null),
        temperature: Joi.number().min(35).max(42).allow(null),
        weight: Joi.number().min(30).max(300).allow(null),
        hemoglobinLevel: Joi.number().min(5).max(20).allow(null),
        donationNotes: Joi.string().allow(null, '')
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

      const donation = await donationService.createDonation(
        value,
        worker.id,
        req.ip,
        req.get('User-Agent')
      );

      res.status(201).json(donation);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Update donation status
  async updateDonationStatus(req, res) {
    try {
      const { donationId } = req.params;
      
      const schema = Joi.object({
        status: Joi.string().valid('completed', 'in_progress', 'cancelled', 'deferred').required(),
        notes: Joi.string().allow(null, '')
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

      const donation = await donationService.updateDonationStatus(
        donationId,
        value.status,
        worker.id,
        req.ip,
        req.get('User-Agent'),
        value.notes
      );

      res.json(donation);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get donations by donor
  async getDonationsByDonor(req, res) {
    try {
      const { donorId } = req.params;
      const { page = 1, limit = 10, status } = req.query;

      const result = await donationService.getDonationsByDonor(donorId, {
        page: parseInt(page),
        limit: parseInt(limit),
        status
      });

      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get donation by ID
  async getDonationById(req, res) {
    try {
      const { donationId } = req.params;

      const donation = await donationService.getDonationById(donationId);
      res.json(donation);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },

  // Get all donations (for BTD/Owner)
  async getAllDonations(req, res) {
    try {
      const { page = 1, limit = 10, status, dateFrom, dateTo, bloodType } = req.query;

      const result = await donationService.getAllDonations({
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        dateFrom,
        dateTo,
        bloodType
      });

      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Check donor eligibility
  async checkDonorEligibility(req, res) {
    try {
      const { donorId } = req.params;

      const eligibility = await donationService.checkDonorEligibility(donorId);
      res.json(eligibility);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get donation statistics
  async getDonationStats(req, res) {
    try {
      const { dateFrom, dateTo } = req.query;

      const stats = await donationService.getDonationStatistics({
        dateFrom,
        dateTo
      });

      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = donationController;
