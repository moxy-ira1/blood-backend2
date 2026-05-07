const { Message, Donor, User, Worker, BTD } = require('../models');
const authService = require('./authService');

class MessageService {
  async sendMessage(messageData, senderId, ipAddress, userAgent) {
    try {
      const { receiverId, subject, content, messageType, priority = 'medium', attachmentUrl, replyToMessageId } = messageData;

      // Validate sender and receiver
      const sender = await Donor.findByPk(senderId, {
        include: [{ model: User, as: 'user' }]
      });

      if (!sender) {
        throw new Error('Sender not found');
      }

      const receiver = await Donor.findByPk(receiverId);
      if (!receiver) {
        throw new Error('Receiver not found');
      }

      // Validate message type based on sender and receiver roles
      await this.validateMessageType(sender.user.role, receiver.user.role, messageType);

      const message = await Message.create({
        senderId,
        receiverId,
        subject,
        content,
        messageType,
        priority,
        attachmentUrl,
        replyToMessageId
      });

      // Log audit
      await authService.logAudit(
        senderId,
        'CREATE_MESSAGE',
        'Message',
        message.id,
        `Message sent from ${senderId} to ${receiverId}: ${subject}`,
        ipAddress,
        userAgent,
        null,
        message.toJSON()
      );

      return message;
    } catch (error) {
      throw error;
    }
  }

  async validateMessageType(senderRole, receiverRole, messageType) {
    const validMessageTypes = {
      'donor_to_worker': { sender: 'donor', receiver: 'worker' },
      'donor_to_btd': { sender: 'donor', receiver: 'owner' },
      'worker_to_donor': { sender: 'worker', receiver: 'donor' },
      'btd_to_donor': { sender: 'owner', receiver: 'donor' },
      'worker_to_btd': { sender: 'worker', receiver: 'owner' },
      'btd_to_worker': { sender: 'owner', receiver: 'worker' }
    };

    const validType = validMessageTypes[messageType];
    if (!validType) {
      throw new Error('Invalid message type');
    }

    if (validType.sender !== senderRole || validType.receiver !== receiverRole) {
      throw new Error(`Message type ${messageType} is not valid for ${senderRole} to ${receiverRole} communication`);
    }

    return true;
  }

  async getMessagesByUser(userId, options = {}) {
    try {
      const { page = 1, limit = 10, type = 'all', isRead } = options;
      const offset = (page - 1) * limit;

      let whereClause = {};
      
      if (type === 'sent') {
        whereClause.senderId = userId;
      } else if (type === 'received') {
        whereClause.receiverId = userId;
      } else {
        // all messages where user is either sender or receiver
        whereClause = {
          [require('sequelize').Op.or]: [
            { senderId: userId },
            { receiverId: userId }
          ]
        };
      }

      if (isRead !== undefined) {
        whereClause.isRead = isRead === 'true';
      }

      const { count, rows } = await Message.findAndCountAll({
        where: whereClause,
        include: [
          { 
            model: Donor, 
            as: 'sender', 
            attributes: ['id', 'firstName', 'lastName', 'donorId'],
            include: [{ 
              model: User, 
              as: 'user', 
              attributes: ['role'] 
            }]
          },
          { 
            model: Donor, 
            as: 'receiver', 
            attributes: ['id', 'firstName', 'lastName', 'donorId'],
            include: [{ 
              model: User, 
              as: 'user', 
              attributes: ['role'] 
            }]
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      return {
        messages: rows,
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

  async getMessageById(messageId, userId) {
    try {
      const message = await Message.findByPk(messageId, {
        include: [
          { 
            model: Donor, 
            as: 'sender', 
            attributes: ['id', 'firstName', 'lastName', 'donorId'],
            include: [{ 
              model: User, 
              as: 'user', 
              attributes: ['role'] 
            }]
          },
          { 
            model: Donor, 
            as: 'receiver', 
            attributes: ['id', 'firstName', 'lastName', 'donorId'],
            include: [{ 
              model: User, 
              as: 'user', 
              attributes: ['role'] 
            }]
          }
        ]
      });

      if (!message) {
        throw new Error('Message not found');
      }

      // Check if user is sender or receiver
      if (message.senderId !== userId && message.receiverId !== userId) {
        throw new Error('Access denied');
      }

      return message;
    } catch (error) {
      throw error;
    }
  }

  async markAsRead(messageId, userId) {
    try {
      const message = await Message.findByPk(messageId);

      if (!message) {
        throw new Error('Message not found');
      }

      if (message.receiverId !== userId) {
        throw new Error('Only receiver can mark message as read');
      }

      if (!message.isRead) {
        message.isRead = true;
        message.readAt = new Date();
        await message.save();
      }

      return message;
    } catch (error) {
      throw error;
    }
  }

  async markMultipleAsRead(messageIds, userId) {
    try {
      const messages = await Message.findAll({
        where: {
          id: messageIds,
          receiverId: userId,
          isRead: false
        }
      });

      if (messages.length === 0) {
        throw new Error('No unread messages found');
      }

      const readAt = new Date();
      await Message.update(
        { isRead: true, readAt },
        {
          where: {
            id: messageIds,
            receiverId: userId,
            isRead: false
          }
        }
      );

      return { markedAsRead: messages.length };
    } catch (error) {
      throw error;
    }
  }

  async deleteMessage(messageId, userId) {
    try {
      const message = await Message.findByPk(messageId);

      if (!message) {
        throw new Error('Message not found');
      }

      // Only sender can delete messages
      if (message.senderId !== userId) {
        throw new Error('Only sender can delete messages');
      }

      await message.destroy();

      return { message: 'Message deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  async getConversation(userId1, userId2, options = {}) {
    try {
      const { page = 1, limit = 50 } = options;
      const offset = (page - 1) * limit;

      const whereClause = {
        [require('sequelize').Op.or]: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 }
        ]
      };

      const { count, rows } = await Message.findAndCountAll({
        where: whereClause,
        include: [
          { 
            model: Donor, 
            as: 'sender', 
            attributes: ['id', 'firstName', 'lastName', 'donorId']
          },
          { 
            model: Donor, 
            as: 'receiver', 
            attributes: ['id', 'firstName', 'lastName', 'donorId']
          }
        ],
        order: [['createdAt', 'ASC']],
        limit: parseInt(limit),
        offset
      });

      return {
        conversation: rows,
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

  async getUnreadCount(userId) {
    try {
      const count = await Message.count({
        where: {
          receiverId: userId,
          isRead: false
        }
      });

      return { unreadCount: count };
    } catch (error) {
      throw error;
    }
  }

  async getMessageStatistics(userId) {
    try {
      const stats = await Message.findAll({
        where: {
          [require('sequelize').Op.or]: [
            { senderId: userId },
            { receiverId: userId }
          ]
        },
        attributes: [
          [require('sequelize').fn('COUNT', require('sequelize').literal("CASE WHEN senderId = '" + userId + "' THEN 1 END")), 'sent'],
          [require('sequelize').fn('COUNT', require('sequelize').literal("CASE WHEN receiverId = '" + userId + "' THEN 1 END")), 'received'],
          [require('sequelize').fn('COUNT', require('sequelize').literal("CASE WHEN receiverId = '" + userId + "' AND isRead = false THEN 1 END")), 'unread']
        ]
      });

      const result = stats[0].get({ plain: true });

      return {
        sent: parseInt(result.sent) || 0,
        received: parseInt(result.received) || 0,
        unread: parseInt(result.unread) || 0
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new MessageService();
