const workerService = require('../services/workerService');
const Joi = require('joi');

const workerController = {
  // Create new worker (owner only)
  async createWorker(req, res) {
    try {
      const schema = Joi.object({
        email: Joi.string().email().required(),
        phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
        btdId: Joi.string().uuid().required(),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        employeeId: Joi.string().required(),
        position: Joi.string().required(),
        department: Joi.string().allow(null, ''),
        qualifications: Joi.array().allow(null),
        hireDate: Joi.date().required()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const result = await workerService.createWorker(
        value,
        req.ip,
        req.get('User-Agent')
      );

      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Update worker
  async updateWorker(req, res) {
    try {
      const { workerId } = req.params;
      
      const schema = Joi.object({
        email: Joi.string().email(),
        phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/),
        firstName: Joi.string(),
        lastName: Joi.string(),
        position: Joi.string(),
        department: Joi.string().allow(null, ''),
        qualifications: Joi.array().allow(null),
        isActive: Joi.boolean()
      }).min(1);

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const worker = await workerService.updateWorker(
        workerId,
        value,
        req.ip,
        req.get('User-Agent')
      );

      res.json(worker);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get worker by ID
  async getWorkerById(req, res) {
    try {
      const { workerId } = req.params;

      const worker = await workerService.getWorkerById(workerId);
      res.json(worker);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },

  // Get all workers
  async getAllWorkers(req, res) {
    try {
      const { page = 1, limit = 10, btdId, isActive } = req.query;

      const result = await workerService.getAllWorkers({
        page: parseInt(page),
        limit: parseInt(limit),
        btdId,
        isActive
      });

      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get workers by BTD
  async getWorkersByBTD(req, res) {
    try {
      const { btdId } = req.params;
      const { page = 1, limit = 10, isActive } = req.query;

      const result = await workerService.getWorkersByBTD(btdId, {
        page: parseInt(page),
        limit: parseInt(limit),
        isActive
      });

      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Deactivate worker
  async deactivateWorker(req, res) {
    try {
      const { workerId } = req.params;

      const worker = await workerService.deactivateWorker(
        workerId,
        req.ip,
        req.get('User-Agent')
      );

      res.json(worker);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Activate worker
  async activateWorker(req, res) {
    try {
      const { workerId } = req.params;

      const worker = await workerService.activateWorker(
        workerId,
        req.ip,
        req.get('User-Agent')
      );

      res.json(worker);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Delete worker
  async deleteWorker(req, res) {
    try {
      const { workerId } = req.params;

      const result = await workerService.deleteWorker(
        workerId,
        req.ip,
        req.get('User-Agent')
      );

      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get worker statistics
  async getWorkerStats(req, res) {
    try {
      const stats = await workerService.getWorkerStatistics();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = workerController;
