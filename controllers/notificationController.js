const notificationService = require('../services/notificationService');
const Joi = require('joi');

const notificationController = {
  // Get notifications for user
  async getNotifications(req, res) {
    try {
      const donor = await require('../models').Donor.findOne({
        where: { userId: req.user.id }
      });

      if (!donor) {
        return res.status(403).json({ error: 'Donor profile not found' });
      }

      const { page = 1, limit = 10, type, isRead, priority } = req.query;

      const result = await notificationService.getNotificationsByUser(donor.userId, {
        page: parseInt(page),
        limit: parseInt(limit),
        type,
        isRead,
        priority
      });

      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get notification by ID
  async getNotificationById(req, res) {
    try {
      const donor = await require('../models').Donor.findOne({
        where: { userId: req.user.id }
      });

      if (!donor) {
        return res.status(403).json({ error: 'Donor profile not found' });
      }

      const { notificationId } = req.params;

      const notification = await notificationService.getNotificationById(notificationId, donor.userId);
      res.json(notification);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },

  // Mark notification as read
  async markAsRead(req, res) {
    try {
      const donor = await require('../models').Donor.findOne({
        where: { userId: req.user.id }
      });

      if (!donor) {
        return res.status(403).json({ error: 'Donor profile not found' });
      }

      const { notificationId } = req.params;

      const notification = await notificationService.markAsRead(notificationId, donor.userId);
      res.json(notification);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Mark multiple notifications as read
  async markMultipleAsRead(req, res) {
    try {
      const donor = await require('../models').Donor.findOne({
        where: { userId: req.user.id }
      });

      if (!donor) {
        return res.status(403).json({ error: 'Donor profile not found' });
      }

      const schema = Joi.object({
        notificationIds: Joi.array().items(Joi.string().uuid()).min(1).required()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const result = await notificationService.markMultipleAsRead(value.notificationIds, donor.userId);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Mark all notifications as read
  async markAllAsRead(req, res) {
    try {
      const donor = await require('../models').Donor.findOne({
        where: { userId: req.user.id }
      });

      if (!donor) {
        return res.status(403).json({ error: 'Donor profile not found' });
      }

      const result = await notificationService.markAllAsRead(donor.userId);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Delete notification
  async deleteNotification(req, res) {
    try {
      const donor = await require('../models').Donor.findOne({
        where: { userId: req.user.id }
      });

      if (!donor) {
        return res.status(403).json({ error: 'Donor profile not found' });
      }

      const { notificationId } = req.params;

      const result = await notificationService.deleteNotification(notificationId, donor.userId);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get unread count
  async getUnreadCount(req, res) {
    try {
      const donor = await require('../models').Donor.findOne({
        where: { userId: req.user.id }
      });

      if (!donor) {
        return res.status(403).json({ error: 'Donor profile not found' });
      }

      const result = await notificationService.getUnreadCount(donor.userId);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Send scheduled notifications (system endpoint)
  async sendScheduledNotifications(req, res) {
    try {
      const result = await notificationService.sendScheduledNotifications();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create system alert (owner only)
  async createSystemAlert(req, res) {
    try {
      const schema = Joi.object({
        title: Joi.string().min(1).max(255).required(),
        message: Joi.string().min(1).required(),
        priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium')
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      await notificationService.createSystemAlertNotification(
        value.title,
        value.message,
        value.priority
      );

      res.json({ message: 'System alert sent successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create reminder notification
  async createReminder(req, res) {
    try {
      const donor = await require('../models').Donor.findOne({
        where: { userId: req.user.id }
      });

      if (!donor) {
        return res.status(403).json({ error: 'Donor profile not found' });
      }

      const schema = Joi.object({
        title: Joi.string().min(1).max(255).required(),
        message: Joi.string().min(1).required(),
        scheduledFor: Joi.date().min('now').required()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      await notificationService.createReminderNotification(
        donor.userId,
        value.title,
        value.message,
        value.scheduledFor
      );

      res.status(201).json({ message: 'Reminder scheduled successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get notification statistics
  async getNotificationStats(req, res) {
    try {
      const donor = await require('../models').Donor.findOne({
        where: { userId: req.user.id }
      });

      if (!donor) {
        return res.status(403).json({ error: 'Donor profile not found' });
      }

      const stats = await notificationService.getNotificationStatistics(donor.userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = notificationController;
