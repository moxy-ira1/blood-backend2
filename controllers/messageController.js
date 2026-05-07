const messageService = require('../services/messageService');
const Joi = require('joi');

const messageController = {
  // Send message
  async sendMessage(req, res) {
    try {
      const schema = Joi.object({
        receiverId: Joi.string().uuid().required(),
        subject: Joi.string().min(1).max(255).required(),
        content: Joi.string().min(1).required(),
        messageType: Joi.string().valid('donor_to_worker', 'donor_to_btd', 'worker_to_donor', 'btd_to_donor', 'worker_to_btd', 'btd_to_worker').required(),
        priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
        attachmentUrl: Joi.string().uri().allow(null, ''),
        replyToMessageId: Joi.string().uuid().allow(null)
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      // Get donor ID from user
      const donor = await require('../models').Donor.findOne({
        where: { userId: req.user.id }
      });

      if (!donor) {
        return res.status(403).json({ error: 'Donor profile not found' });
      }

      const message = await messageService.sendMessage(
        value,
        donor.id,
        req.ip,
        req.get('User-Agent')
      );

      res.status(201).json(message);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get messages for user
  async getMessages(req, res) {
    try {
      const donor = await require('../models').Donor.findOne({
        where: { userId: req.user.id }
      });

      if (!donor) {
        return res.status(403).json({ error: 'Donor profile not found' });
      }

      const { page = 1, limit = 10, type = 'all', isRead } = req.query;

      const result = await messageService.getMessagesByUser(donor.id, {
        page: parseInt(page),
        limit: parseInt(limit),
        type,
        isRead
      });

      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get message by ID
  async getMessageById(req, res) {
    try {
      const donor = await require('../models').Donor.findOne({
        where: { userId: req.user.id }
      });

      if (!donor) {
        return res.status(403).json({ error: 'Donor profile not found' });
      }

      const { messageId } = req.params;

      const message = await messageService.getMessageById(messageId, donor.id);
      res.json(message);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },

  // Mark message as read
  async markAsRead(req, res) {
    try {
      const donor = await require('../models').Donor.findOne({
        where: { userId: req.user.id }
      });

      if (!donor) {
        return res.status(403).json({ error: 'Donor profile not found' });
      }

      const { messageId } = req.params;

      const message = await messageService.markAsRead(messageId, donor.id);
      res.json(message);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Mark multiple messages as read
  async markMultipleAsRead(req, res) {
    try {
      const donor = await require('../models').Donor.findOne({
        where: { userId: req.user.id }
      });

      if (!donor) {
        return res.status(403).json({ error: 'Donor profile not found' });
      }

      const schema = Joi.object({
        messageIds: Joi.array().items(Joi.string().uuid()).min(1).required()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const result = await messageService.markMultipleAsRead(value.messageIds, donor.id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Delete message
  async deleteMessage(req, res) {
    try {
      const donor = await require('../models').Donor.findOne({
        where: { userId: req.user.id }
      });

      if (!donor) {
        return res.status(403).json({ error: 'Donor profile not found' });
      }

      const { messageId } = req.params;

      const result = await messageService.deleteMessage(messageId, donor.id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get conversation between two users
  async getConversation(req, res) {
    try {
      const donor = await require('../models').Donor.findOne({
        where: { userId: req.user.id }
      });

      if (!donor) {
        return res.status(403).json({ error: 'Donor profile not found' });
      }

      const { otherUserId } = req.params;
      const { page = 1, limit = 50 } = req.query;

      const result = await messageService.getConversation(donor.id, otherUserId, {
        page: parseInt(page),
        limit: parseInt(limit)
      });

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

      const result = await messageService.getUnreadCount(donor.id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get message statistics
  async getMessageStats(req, res) {
    try {
      const donor = await require('../models').Donor.findOne({
        where: { userId: req.user.id }
      });

      if (!donor) {
        return res.status(403).json({ error: 'Donor profile not found' });
      }

      const stats = await messageService.getMessageStatistics(donor.id);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = messageController;
