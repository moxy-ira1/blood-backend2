const authService = require('../services/authService');
const Joi = require('joi');

const authController = {
  // Owner login with email and password
  async ownerLogin(req, res) {
    try {
      const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { email, password } = value;
      const ipAddress = req.ip;
      const userAgent = req.get('User-Agent');

      const result = await authService.ownerLogin(email, password, ipAddress, userAgent);
      res.json(result);
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  },

  // Send OTP to worker phone
  async sendWorkerOTP(req, res) {
    try {
      const schema = Joi.object({
        phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { phone } = value;
      const result = await authService.sendWorkerOTP(phone);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Worker login with phone and OTP
  async workerLogin(req, res) {
    try {
      const schema = Joi.object({
        phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
        otp: Joi.string().length(6).pattern(/^\d+$/).required()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { phone, otp } = value;
      const ipAddress = req.ip;
      const userAgent = req.get('User-Agent');

      const result = await authService.workerLogin(phone, otp, ipAddress, userAgent);
      res.json(result);
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  },

  // Donor login with ID number
  async donorLogin(req, res) {
    try {
      const schema = Joi.object({
        idNumber: Joi.string().required()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { idNumber } = value;
      const ipAddress = req.ip;
      const userAgent = req.get('User-Agent');

      const result = await authService.donorLogin(idNumber, ipAddress, userAgent);
      res.json(result);
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  },

  // Verify token endpoint
  async verifyToken(req, res) {
    try {
      const user = await authService.verifyToken(req.user.id);
      res.json({ valid: true, user });
    } catch (error) {
      res.status(401).json({ valid: false, error: error.message });
    }
  },

  // Logout endpoint (for audit logging)
  async logout(req, res) {
    try {
      const ipAddress = req.ip;
      const userAgent = req.get('User-Agent');

      await authService.logAudit(
        req.user.id, 
        'LOGOUT', 
        'User', 
        req.user.id, 
        'User logout', 
        ipAddress, 
        userAgent
      );

      res.json({ message: 'Logout successful' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = authController;
