const { Notification, Donor, User } = require('../models');
const authService = require('./authService');
const moment = require('moment');

class NotificationService {
  async createNotification(notificationData) {
    try {
      const { userId, title, message, type, priority = 'medium', actionRequired = false, actionUrl, relatedEntityId, relatedEntityType, scheduledFor } = notificationData;

      const notification = await Notification.create({
        userId,
        title,
        message,
        type,
        priority,
        actionRequired,
        actionUrl,
        relatedEntityId,
        relatedEntityType,
        scheduledFor,
        sentAt: scheduledFor ? null : new Date()
      });

      return notification;
    } catch (error) {
      console.error('Failed to create notification:', error);
      throw error;
    }
  }

  async getNotificationsByUser(userId, options = {}) {
    try {
      const { page = 1, limit = 10, type, isRead, priority } = options;
      const offset = (page - 1) * limit;

      const whereClause = { userId };
      
      if (type) {
        whereClause.type = type;
      }
      if (isRead !== undefined) {
        whereClause.isRead = isRead === 'true';
      }
      if (priority) {
        whereClause.priority = priority;
      }

      const { count, rows } = await Notification.findAndCountAll({
        where: whereClause,
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      return {
        notifications: rows,
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

  async getNotificationById(notificationId, userId) {
    try {
      const notification = await Notification.findByPk(notificationId);

      if (!notification) {
        throw new Error('Notification not found');
      }

      if (notification.userId !== userId) {
        throw new Error('Access denied');
      }

      return notification;
    } catch (error) {
      throw error;
    }
  }

  async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findByPk(notificationId);

      if (!notification) {
        throw new Error('Notification not found');
      }

      if (notification.userId !== userId) {
        throw new Error('Access denied');
      }

      if (!notification.isRead) {
        notification.isRead = true;
        notification.readAt = new Date();
        await notification.save();
      }

      return notification;
    } catch (error) {
      throw error;
    }
  }

  async markMultipleAsRead(notificationIds, userId) {
    try {
      const notifications = await Notification.findAll({
        where: {
          id: notificationIds,
          userId: userId,
          isRead: false
        }
      });

      if (notifications.length === 0) {
        throw new Error('No unread notifications found');
      }

      const readAt = new Date();
      await Notification.update(
        { isRead: true, readAt },
        {
          where: {
            id: notificationIds,
            userId: userId,
            isRead: false
          }
        }
      );

      return { markedAsRead: notifications.length };
    } catch (error) {
      throw error;
    }
  }

  async markAllAsRead(userId) {
    try {
      const unreadCount = await Notification.count({
        where: {
          userId: userId,
          isRead: false
        }
      });

      if (unreadCount === 0) {
        return { markedAsRead: 0 };
      }

      const readAt = new Date();
      await Notification.update(
        { isRead: true, readAt },
        {
          where: {
            userId: userId,
            isRead: false
          }
        }
      );

      return { markedAsRead: unreadCount };
    } catch (error) {
      throw error;
    }
  }

  async deleteNotification(notificationId, userId) {
    try {
      const notification = await Notification.findByPk(notificationId);

      if (!notification) {
        throw new Error('Notification not found');
      }

      if (notification.userId !== userId) {
        throw new Error('Access denied');
      }

      await notification.destroy();

      return { message: 'Notification deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  async getUnreadCount(userId) {
    try {
      const count = await Notification.count({
        where: {
          userId: userId,
          isRead: false
        }
      });

      return { unreadCount: count };
    } catch (error) {
      throw error;
    }
  }

  async sendScheduledNotifications() {
    try {
      const now = new Date();
      
      const scheduledNotifications = await Notification.findAll({
        where: {
          scheduledFor: {
            [require('sequelize').Op.lte]: now
          },
          sentAt: null
        }
      });

      const sentNotifications = [];
      for (const notification of scheduledNotifications) {
        notification.sentAt = now;
        await notification.save();
        sentNotifications.push(notification);
      }

      return {
        sentNotifications: sentNotifications.length,
        notifications: sentNotifications
      };
    } catch (error) {
      throw error;
    }
  }

  async createDonationSuccessNotification(donor, donation) {
    try {
      await this.createNotification({
        userId: donor.userId,
        title: 'Donation Successful',
        message: `Thank you for donating blood! Your donation of ${donation.quantityML}ml of ${donation.bloodType} blood has been successfully collected. You have saved lives today!`,
        type: 'donation_success',
        priority: 'medium',
        actionRequired: false,
        relatedEntityId: donation.id,
        relatedEntityType: 'Donation'
      });
    } catch (error) {
      console.error('Failed to create donation success notification:', error);
    }
  }

  async createBloodTestResultNotification(donor, bloodTest, isEligible, reasons) {
    try {
      const title = isEligible ? 'Blood Test Results - Eligible' : 'Blood Test Results - Not Eligible';
      const message = isEligible 
        ? `Your recent blood test results show you are eligible to donate blood. Thank you for your commitment to saving lives!`
        : `Your recent blood test results show you are currently not eligible to donate blood. Reasons: ${reasons.join(', ')}. Please consult with healthcare staff for more information.`;

      await this.createNotification({
        userId: donor.userId,
        title,
        message,
        type: 'blood_test_result',
        priority: isEligible ? 'medium' : 'high',
        actionRequired: !isEligible,
        relatedEntityId: bloodTest.id,
        relatedEntityType: 'BloodTest'
      });
    } catch (error) {
      console.error('Failed to create blood test result notification:', error);
    }
  }

  async createEligibilityChangeNotification(donor, oldStatus, newStatus) {
    try {
      const title = 'Eligibility Status Changed';
      const message = `Your eligibility status has changed from ${oldStatus} to ${newStatus}. ${newStatus === 'eligible' ? 'You are now eligible to donate blood!' : 'Please contact the blood bank for more information.'}`;

      await this.createNotification({
        userId: donor.userId,
        title,
        message,
        type: 'eligibility_change',
        priority: newStatus === 'eligible' ? 'medium' : 'high',
        actionRequired: newStatus !== 'eligible',
        relatedEntityId: donor.id,
        relatedEntityType: 'Donor'
      });
    } catch (error) {
      console.error('Failed to create eligibility change notification:', error);
    }
  }

  async createBloodExpiryNotification(inventory) {
    try {
      // Find BTD owner to notify
      const { User, BTD } = require('../models');
      const btdOwner = await User.findOne({
        where: { role: 'owner', isActive: true },
        include: [{ model: BTD, as: 'btd' }]
      });

      if (btdOwner) {
        await this.createNotification({
          userId: btdOwner.id,
          title: 'Blood Expired',
          message: `${inventory.quantityML}ml of ${inventory.bloodType} blood has expired on ${inventory.expiryDate}. Please remove from inventory.`,
          type: 'blood_expiry',
          priority: 'high',
          actionRequired: true,
          relatedEntityId: inventory.id,
          relatedEntityType: 'Inventory'
        });
      }
    } catch (error) {
      console.error('Failed to create blood expiry notification:', error);
    }
  }

  async createSystemAlertNotification(title, message, priority = 'medium') {
    try {
      // Send to all active users
      const users = await User.findAll({
        where: { isActive: true },
        attributes: ['id']
      });

      for (const user of users) {
        await this.createNotification({
          userId: user.id,
          title,
          message,
          type: 'system_alert',
          priority
        });
      }
    } catch (error) {
      console.error('Failed to create system alert notification:', error);
    }
  }

  async createReminderNotification(userId, title, message, scheduledFor) {
    try {
      await this.createNotification({
        userId,
        title,
        message,
        type: 'reminder',
        priority: 'medium',
        actionRequired: true,
        scheduledFor
      });
    } catch (error) {
      console.error('Failed to create reminder notification:', error);
    }
  }

  async getNotificationStatistics(userId) {
    try {
      const stats = await Notification.findAll({
        where: { userId },
        attributes: [
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'total'],
          [require('sequelize').fn('COUNT', require('sequelize').literal("CASE WHEN isRead = false THEN 1 END")), 'unread'],
          [require('sequelize').fn('COUNT', require('sequelize').literal("CASE WHEN type = 'donation_success' THEN 1 END")), 'donationSuccess'],
          [require('sequelize').fn('COUNT', require('sequelize').literal("CASE WHEN type = 'blood_test_result' THEN 1 END")), 'bloodTestResult'],
          [require('sequelize').fn('COUNT', require('sequelize').literal("CASE WHEN type = 'eligibility_change' THEN 1 END")), 'eligibilityChange'],
          [require('sequelize').fn('COUNT', require('sequelize').literal("CASE WHEN type = 'blood_expiry' THEN 1 END")), 'bloodExpiry'],
          [require('sequelize').fn('COUNT', require('sequelize').literal("CASE WHEN priority = 'high' THEN 1 END")), 'highPriority'],
          [require('sequelize').fn('COUNT', require('sequelize').literal("CASE WHEN actionRequired = true THEN 1 END")), 'actionRequired']
        ]
      });

      const result = stats[0].get({ plain: true });

      return {
        total: parseInt(result.total) || 0,
        unread: parseInt(result.unread) || 0,
        donationSuccess: parseInt(result.donationSuccess) || 0,
        bloodTestResult: parseInt(result.bloodTestResult) || 0,
        eligibilityChange: parseInt(result.eligibilityChange) || 0,
        bloodExpiry: parseInt(result.bloodExpiry) || 0,
        highPriority: parseInt(result.highPriority) || 0,
        actionRequired: parseInt(result.actionRequired) || 0
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new NotificationService();
