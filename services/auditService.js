const { AuditLog, User, Donor, Worker, BTD } = require('../models');

class AuditService {
  async createAuditLog(auditData) {
    try {
      const { userId, action, entityType, entityId, description, ipAddress, userAgent, oldValue, newValue, status = 'success', errorMessage } = auditData;

      const auditLog = await AuditLog.create({
        userId,
        action,
        entityType,
        entityId,
        description,
        ipAddress,
        userAgent,
        oldValue,
        newValue,
        status,
        errorMessage
      });

      return auditLog;
    } catch (error) {
      console.error('Failed to create audit log:', error);
      throw error;
    }
  }

  async getAuditLogs(options = {}) {
    try {
      const { page = 1, limit = 10, action, entityType, userId, status, dateFrom, dateTo } = options;
      const offset = (page - 1) * limit;

      const whereClause = {};
      
      if (action) {
        whereClause.action = action;
      }
      if (entityType) {
        whereClause.entityType = entityType;
      }
      if (userId) {
        whereClause.userId = userId;
      }
      if (status) {
        whereClause.status = status;
      }
      if (dateFrom || dateTo) {
        whereClause.createdAt = {};
        if (dateFrom) whereClause.createdAt[require('sequelize').Op.gte] = new Date(dateFrom);
        if (dateTo) whereClause.createdAt[require('sequelize').Op.lte] = new Date(dateTo);
      }

      const { count, rows } = await AuditLog.findAndCountAll({
        where: whereClause,
        include: [
          { 
            model: User, 
            as: 'user', 
            attributes: ['id', 'email', 'phone', 'role'],
            include: [
              { model: Donor, as: 'donor', attributes: ['firstName', 'lastName', 'donorId'] },
              { model: Worker, as: 'worker', attributes: ['firstName', 'lastName', 'employeeId'] },
              { model: BTD, as: 'btd', attributes: ['name', 'licenseNumber'] }
            ]
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      return {
        auditLogs: rows,
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

  async getAuditLogById(auditLogId) {
    try {
      const auditLog = await AuditLog.findByPk(auditLogId, {
        include: [
          { 
            model: User, 
            as: 'user', 
            attributes: ['id', 'email', 'phone', 'role'],
            include: [
              { model: Donor, as: 'donor', attributes: ['firstName', 'lastName', 'donorId'] },
              { model: Worker, as: 'worker', attributes: ['firstName', 'lastName', 'employeeId'] },
              { model: BTD, as: 'btd', attributes: ['name', 'licenseNumber'] }
            ]
          }
        ]
      });

      if (!auditLog) {
        throw new Error('Audit log not found');
      }

      return auditLog;
    } catch (error) {
      throw error;
    }
  }

  async getAuditLogsByEntity(entityType, entityId, options = {}) {
    try {
      const { page = 1, limit = 10, action } = options;
      const offset = (page - 1) * limit;

      const whereClause = { entityType, entityId };
      if (action) {
        whereClause.action = action;
      }

      const { count, rows } = await AuditLog.findAndCountAll({
        where: whereClause,
        include: [
          { 
            model: User, 
            as: 'user', 
            attributes: ['id', 'email', 'phone', 'role'],
            include: [
              { model: Donor, as: 'donor', attributes: ['firstName', 'lastName', 'donorId'] },
              { model: Worker, as: 'worker', attributes: ['firstName', 'lastName', 'employeeId'] },
              { model: BTD, as: 'btd', attributes: ['name', 'licenseNumber'] }
            ]
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      return {
        auditLogs: rows,
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

  async getAuditLogsByUser(userId, options = {}) {
    try {
      const { page = 1, limit = 10, action, entityType } = options;
      const offset = (page - 1) * limit;

      const whereClause = { userId };
      if (action) {
        whereClause.action = action;
      }
      if (entityType) {
        whereClause.entityType = entityType;
      }

      const { count, rows } = await AuditLog.findAndCountAll({
        where: whereClause,
        include: [
          { 
            model: User, 
            as: 'user', 
            attributes: ['id', 'email', 'phone', 'role'],
            include: [
              { model: Donor, as: 'donor', attributes: ['firstName', 'lastName', 'donorId'] },
              { model: Worker, as: 'worker', attributes: ['firstName', 'lastName', 'employeeId'] },
              { model: BTD, as: 'btd', attributes: ['name', 'licenseNumber'] }
            ]
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      return {
        auditLogs: rows,
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

  async getAuditStatistics(options = {}) {
    try {
      const { dateFrom, dateTo } = options;
      
      const whereClause = {};
      if (dateFrom || dateTo) {
        whereClause.createdAt = {};
        if (dateFrom) whereClause.createdAt[require('sequelize').Op.gte] = new Date(dateFrom);
        if (dateTo) whereClause.createdAt[require('sequelize').Op.lte] = new Date(dateTo);
      }

      // Overall statistics
      const overallStats = await AuditLog.findAll({
        where: whereClause,
        attributes: [
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'total'],
          [require('sequelize').fn('COUNT', require('sequelize').literal("CASE WHEN status = 'success' THEN 1 END")), 'success'],
          [require('sequelize').fn('COUNT', require('sequelize').literal("CASE WHEN status = 'failure' THEN 1 END")), 'failure'],
          [require('sequelize').fn('COUNT', require('sequelize').literal("CASE WHEN status = 'warning' THEN 1 END")), 'warning']
        ]
      });

      // Action type statistics
      const actionStats = await AuditLog.findAll({
        where: whereClause,
        attributes: [
          'action',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
        ],
        group: ['action']
      });

      // Entity type statistics
      const entityStats = await AuditLog.findAll({
        where: whereClause,
        attributes: [
          'entityType',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
        ],
        group: ['entityType']
      });

      const overall = overallStats[0].get({ plain: true });

      return {
        overall: {
          total: parseInt(overall.total) || 0,
          success: parseInt(overall.success) || 0,
          failure: parseInt(overall.failure) || 0,
          warning: parseInt(overall.warning) || 0
        },
        byAction: actionStats.map(stat => stat.get({ plain: true })),
        byEntityType: entityStats.map(stat => stat.get({ plain: true }))
      };
    } catch (error) {
      throw error;
    }
  }

  async getRecentActivity(limit = 10) {
    try {
      const recentLogs = await AuditLog.findAll({
        include: [
          { 
            model: User, 
            as: 'user', 
            attributes: ['id', 'email', 'phone', 'role'],
            include: [
              { model: Donor, as: 'donor', attributes: ['firstName', 'lastName', 'donorId'] },
              { model: Worker, as: 'worker', attributes: ['firstName', 'lastName', 'employeeId'] },
              { model: BTD, as: 'btd', attributes: ['name', 'licenseNumber'] }
            ]
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit)
      });

      return recentLogs;
    } catch (error) {
      throw error;
    }
  }

  async getFailedAttempts(options = {}) {
    try {
      const { page = 1, limit = 10, dateFrom, dateTo } = options;
      const offset = (page - 1) * limit;

      const whereClause = { status: 'failure' };
      if (dateFrom || dateTo) {
        whereClause.createdAt = {};
        if (dateFrom) whereClause.createdAt[require('sequelize').Op.gte] = new Date(dateFrom);
        if (dateTo) whereClause.createdAt[require('sequelize').Op.lte] = new Date(dateTo);
      }

      const { count, rows } = await AuditLog.findAndCountAll({
        where: whereClause,
        include: [
          { 
            model: User, 
            as: 'user', 
            attributes: ['id', 'email', 'phone', 'role']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      return {
        failedAttempts: rows,
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

  async exportAuditLogs(options = {}) {
    try {
      const { dateFrom, dateTo, action, entityType, userId, status } = options;
      
      const whereClause = {};
      if (action) whereClause.action = action;
      if (entityType) whereClause.entityType = entityType;
      if (userId) whereClause.userId = userId;
      if (status) whereClause.status = status;
      if (dateFrom || dateTo) {
        whereClause.createdAt = {};
        if (dateFrom) whereClause.createdAt[require('sequelize').Op.gte] = new Date(dateFrom);
        if (dateTo) whereClause.createdAt[require('sequelize').Op.lte] = new Date(dateTo);
      }

      const auditLogs = await AuditLog.findAll({
        where: whereClause,
        include: [
          { 
            model: User, 
            as: 'user', 
            attributes: ['id', 'email', 'phone', 'role']
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      return auditLogs;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AuditService();
