const auditService = require('../services/auditService');
const Joi = require('joi');

const auditController = {
  // Get all audit logs
  async getAuditLogs(req, res) {
    try {
      const { page = 1, limit = 10, action, entityType, userId, status, dateFrom, dateTo } = req.query;

      const result = await auditService.getAuditLogs({
        page: parseInt(page),
        limit: parseInt(limit),
        action,
        entityType,
        userId,
        status,
        dateFrom,
        dateTo
      });

      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get audit log by ID
  async getAuditLogById(req, res) {
    try {
      const { auditLogId } = req.params;

      const auditLog = await auditService.getAuditLogById(auditLogId);
      res.json(auditLog);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },

  // Get audit logs by entity
  async getAuditLogsByEntity(req, res) {
    try {
      const { entityType, entityId } = req.params;
      const { page = 1, limit = 10, action } = req.query;

      const result = await auditService.getAuditLogsByEntity(entityType, entityId, {
        page: parseInt(page),
        limit: parseInt(limit),
        action
      });

      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get audit logs by user
  async getAuditLogsByUser(req, res) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 10, action, entityType } = req.query;

      const result = await auditService.getAuditLogsByUser(userId, {
        page: parseInt(page),
        limit: parseInt(limit),
        action,
        entityType
      });

      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get audit statistics
  async getAuditStats(req, res) {
    try {
      const { dateFrom, dateTo } = req.query;

      const stats = await auditService.getAuditStatistics({
        dateFrom,
        dateTo
      });

      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get recent activity
  async getRecentActivity(req, res) {
    try {
      const { limit = 10 } = req.query;

      const activity = await auditService.getRecentActivity(parseInt(limit));
      res.json(activity);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get failed attempts
  async getFailedAttempts(req, res) {
    try {
      const { page = 1, limit = 10, dateFrom, dateTo } = req.query;

      const result = await auditService.getFailedAttempts({
        page: parseInt(page),
        limit: parseInt(limit),
        dateFrom,
        dateTo
      });

      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Export audit logs
  async exportAuditLogs(req, res) {
    try {
      const { action, entityType, userId, status, dateFrom, dateTo } = req.query;

      const auditLogs = await auditService.exportAuditLogs({
        action,
        entityType,
        userId,
        status,
        dateFrom,
        dateTo
      });

      // Set headers for CSV download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=audit-logs.csv');

      // Convert to CSV format
      const csvHeader = 'ID,User,Action,Entity Type,Entity ID,Description,Status,IP Address,User Agent,Created At\n';
      const csvData = auditLogs.map(log => {
        const user = log.user ? `${log.user.email || log.user.phone}` : 'System';
        return `${log.id},${user},${log.action},${log.entityType},${log.entityId},"${log.description}",${log.status},${log.ipAddress || ''},"${log.userAgent || ''}",${log.createdAt}`;
      }).join('\n');

      res.send(csvHeader + csvData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = auditController;
