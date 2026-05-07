const bloodTestService = require('../services/bloodTestService');
const Joi = require('joi');

const bloodTestController = {
  // Create new blood test
  async createBloodTest(req, res) {
    try {
      const schema = Joi.object({
        donorId: Joi.string().uuid().required(),
        hivResult: Joi.string().valid('positive', 'negative', 'pending').default('pending'),
        hepatitisBResult: Joi.string().valid('positive', 'negative', 'pending').default('pending'),
        hepatitisCResult: Joi.string().valid('positive', 'negative', 'pending').default('pending'),
        malariaResult: Joi.string().valid('positive', 'negative', 'pending').default('pending'),
        hemoglobinLevel: Joi.number().positive().allow(null),
        testNotes: Joi.string().allow(null, '')
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

      const bloodTest = await bloodTestService.createBloodTest(
        value,
        worker.id,
        req.ip,
        req.get('User-Agent')
      );

      res.status(201).json(bloodTest);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Update blood test
  async updateBloodTest(req, res) {
    try {
      const { testId } = req.params;
      
      const schema = Joi.object({
        hivResult: Joi.string().valid('positive', 'negative', 'pending'),
        hepatitisBResult: Joi.string().valid('positive', 'negative', 'pending'),
        hepatitisCResult: Joi.string().valid('positive', 'negative', 'pending'),
        malariaResult: Joi.string().valid('positive', 'negative', 'pending'),
        hemoglobinLevel: Joi.number().positive().allow(null),
        testNotes: Joi.string().allow(null, '')
      }).min(1);

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

      const bloodTest = await bloodTestService.updateBloodTest(
        testId,
        value,
        worker.id,
        req.ip,
        req.get('User-Agent')
      );

      res.json(bloodTest);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Complete blood test and evaluate eligibility
  async completeBloodTest(req, res) {
    try {
      const { testId } = req.params;

      const worker = await require('../models').Worker.findOne({
        where: { userId: req.user.id }
      });

      if (!worker) {
        return res.status(403).json({ error: 'Worker profile not found' });
      }

      const bloodTest = await bloodTestService.completeBloodTest(
        testId,
        worker.id,
        req.ip,
        req.get('User-Agent')
      );

      res.json(bloodTest);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get blood tests by donor
  async getBloodTestsByDonor(req, res) {
    try {
      const { donorId } = req.params;
      const { page = 1, limit = 10, status } = req.query;

      const result = await bloodTestService.getBloodTestsByDonor(donorId, {
        page: parseInt(page),
        limit: parseInt(limit),
        status
      });

      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get blood test by ID
  async getBloodTestById(req, res) {
    try {
      const { testId } = req.params;

      const bloodTest = await bloodTestService.getBloodTestById(testId);
      res.json(bloodTest);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },

  // Get all blood tests (for BTD/Owner)
  async getAllBloodTests(req, res) {
    try {
      const { page = 1, limit = 10, status, dateFrom, dateTo } = req.query;

      const result = await bloodTestService.getAllBloodTests({
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        dateFrom,
        dateTo
      });

      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get blood test statistics
  async getBloodTestStats(req, res) {
    try {
      const { BloodTest } = require('../models');
      
      const stats = await BloodTest.findAll({
        attributes: [
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'total'],
          [require('sequelize').fn('COUNT', require('sequelize').literal("CASE WHEN overallResult = 'eligible' THEN 1 END")), 'eligible'],
          [require('sequelize').fn('COUNT', require('sequelize').literal("CASE WHEN overallResult = 'not_eligible' THEN 1 END")), 'notEligible'],
          [require('sequelize').fn('COUNT', require('sequelize').literal("CASE WHEN overallResult = 'pending' THEN 1 END")), 'pending']
        ]
      });

      const result = stats[0].get({ plain: true });

      res.json({
        total: parseInt(result.total),
        eligible: parseInt(result.eligible),
        notEligible: parseInt(result.notEligible),
        pending: parseInt(result.pending)
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = bloodTestController;
