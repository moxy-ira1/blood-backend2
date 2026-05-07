const userService = require('../services/userService');
const Joi = require('joi');

const userController = {
  // Create new user (owner only)
  async createUser(req, res) {
    try {
      const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).allow(null),
        role: Joi.string().valid('owner', 'worker', 'donor').required(),
        // BTD profile fields
        name: Joi.string().when('role', { is: 'owner', then: Joi.required(), otherwise: Joi.optional() }),
        licenseNumber: Joi.string().when('role', { is: 'owner', then: Joi.required(), otherwise: Joi.optional() }),
        address: Joi.string().when('role', { is: 'owner', then: Joi.required(), otherwise: Joi.optional() }),
        city: Joi.string().when('role', { is: 'owner', then: Joi.required(), otherwise: Joi.optional() }),
        state: Joi.string().when('role', { is: 'owner', then: Joi.required(), otherwise: Joi.optional() }),
        phoneNumber: Joi.string().when('role', { is: 'owner', then: Joi.required(), otherwise: Joi.optional() }),
        // Worker profile fields
        btdId: Joi.string().uuid().when('role', { is: 'worker', then: Joi.required(), otherwise: Joi.optional() }),
        firstName: Joi.string().when('role', { is: 'worker', then: Joi.required(), otherwise: Joi.optional() }),
        lastName: Joi.string().when('role', { is: 'worker', then: Joi.required(), otherwise: Joi.optional() }),
        employeeId: Joi.string().when('role', { is: 'worker', then: Joi.required(), otherwise: Joi.optional() }),
        position: Joi.string().when('role', { is: 'worker', then: Joi.required(), otherwise: Joi.optional() }),
        // Donor profile fields
        donorId: Joi.string().when('role', { is: 'donor', then: Joi.required(), otherwise: Joi.optional() }),
        dateOfBirth: Joi.date().when('role', { is: 'donor', then: Joi.required(), otherwise: Joi.optional() }),
        gender: Joi.string().valid('male', 'female', 'other').when('role', { is: 'donor', then: Joi.required(), otherwise: Joi.optional() }),
        bloodType: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-').when('role', { is: 'donor', then: Joi.required(), otherwise: Joi.optional() }),
        idNumber: Joi.string().when('role', { is: 'donor', then: Joi.required(), otherwise: Joi.optional() })
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const result = await userService.createUser(
        value,
        req.ip,
        req.get('User-Agent')
      );

      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Update user
  async updateUser(req, res) {
    try {
      const { userId } = req.params;
      
      const schema = Joi.object({
        email: Joi.string().email(),
        password: Joi.string().min(6),
        phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/),
        isActive: Joi.boolean()
      }).min(1);

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const user = await userService.updateUser(
        userId,
        value,
        req.ip,
        req.get('User-Agent')
      );

      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get user by ID
  async getUserById(req, res) {
    try {
      const { userId } = req.params;

      const user = await userService.getUserById(userId);
      res.json(user);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },

  // Get all users
  async getAllUsers(req, res) {
    try {
      const { page = 1, limit = 10, role, isActive } = req.query;

      const result = await userService.getAllUsers({
        page: parseInt(page),
        limit: parseInt(limit),
        role,
        isActive
      });

      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Deactivate user
  async deactivateUser(req, res) {
    try {
      const { userId } = req.params;

      const user = await userService.deactivateUser(
        userId,
        req.ip,
        req.get('User-Agent')
      );

      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Activate user
  async activateUser(req, res) {
    try {
      const { userId } = req.params;

      const user = await userService.activateUser(
        userId,
        req.ip,
        req.get('User-Agent')
      );

      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get user statistics
  async getUserStats(req, res) {
    try {
      const stats = await userService.getUserStatistics();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = userController;
