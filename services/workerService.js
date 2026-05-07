const { Worker, User, BTD } = require('../models');
const authService = require('./authService');

class WorkerService {
  async createWorker(workerData, ipAddress, userAgent) {
    try {
      const { email, phone, btdId, ...workerFields } = workerData;

      // Check if BTD exists
      const btd = await BTD.findByPk(btdId);
      if (!btd) {
        throw new Error('BTD not found');
      }

      // Create user account for worker
      const user = await User.create({
        email,
        phone,
        role: 'worker'
      });

      // Create worker profile
      const worker = await Worker.create({
        userId: user.id,
        btdId,
        ...workerFields
      });

      await authService.logAudit(
        user.id,
        'CREATE_WORKER',
        'Worker',
        worker.id,
        `Worker created: ${workerFields.firstName} ${workerFields.lastName}`,
        ipAddress,
        userAgent,
        null,
        worker.toJSON()
      );

      return { user, worker };
    } catch (error) {
      throw error;
    }
  }

  async updateWorker(workerId, updateData, ipAddress, userAgent) {
    try {
      const worker = await Worker.findByPk(workerId, {
        include: [{ model: User, as: 'user' }]
      });

      if (!worker) {
        throw new Error('Worker not found');
      }

      const oldValue = worker.toJSON();
      
      // Update worker profile
      await worker.update(updateData);

      // Update user email/phone if provided
      if (updateData.email || updateData.phone) {
        const userUpdate = {};
        if (updateData.email) userUpdate.email = updateData.email;
        if (updateData.phone) userUpdate.phone = updateData.phone;
        
        await worker.user.update(userUpdate);
      }

      await authService.logAudit(
        worker.user.id,
        'UPDATE_WORKER',
        'Worker',
        worker.id,
        `Worker updated: ${worker.firstName} ${worker.lastName}`,
        ipAddress,
        userAgent,
        oldValue,
        worker.toJSON()
      );

      return worker;
    } catch (error) {
      throw error;
    }
  }

  async getWorkerById(workerId) {
    try {
      const worker = await Worker.findByPk(workerId, {
        include: [
          { model: User, as: 'user', attributes: { exclude: ['password'] } },
          { model: BTD, as: 'btd' }
        ]
      });

      if (!worker) {
        throw new Error('Worker not found');
      }

      return worker;
    } catch (error) {
      throw error;
    }
  }

  async getAllWorkers(options = {}) {
    try {
      const { page = 1, limit = 10, btdId, isActive } = options;
      const offset = (page - 1) * limit;

      const whereClause = {};
      if (btdId) {
        whereClause.btdId = btdId;
      }
      if (isActive !== undefined) {
        whereClause.isActive = isActive === 'true';
      }

      const { count, rows } = await Worker.findAndCountAll({
        where: whereClause,
        include: [
          { model: User, as: 'user', attributes: { exclude: ['password'] } },
          { model: BTD, as: 'btd' }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      return {
        workers: rows,
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

  async getWorkersByBTD(btdId, options = {}) {
    try {
      const { page = 1, limit = 10, isActive } = options;
      const offset = (page - 1) * limit;

      const whereClause = { btdId };
      if (isActive !== undefined) {
        whereClause.isActive = isActive === 'true';
      }

      const { count, rows } = await Worker.findAndCountAll({
        where: whereClause,
        include: [
          { model: User, as: 'user', attributes: { exclude: ['password'] } }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      return {
        workers: rows,
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

  async deactivateWorker(workerId, ipAddress, userAgent) {
    try {
      const worker = await Worker.findByPk(workerId, {
        include: [{ model: User, as: 'user' }]
      });

      if (!worker) {
        throw new Error('Worker not found');
      }

      const oldValue = worker.toJSON();
      worker.isActive = false;
      await worker.save();

      // Also deactivate user account
      worker.user.isActive = false;
      await worker.user.save();

      await authService.logAudit(
        worker.user.id,
        'UPDATE_WORKER',
        'Worker',
        worker.id,
        `Worker deactivated: ${worker.firstName} ${worker.lastName}`,
        ipAddress,
        userAgent,
        oldValue,
        worker.toJSON()
      );

      return worker;
    } catch (error) {
      throw error;
    }
  }

  async activateWorker(workerId, ipAddress, userAgent) {
    try {
      const worker = await Worker.findByPk(workerId, {
        include: [{ model: User, as: 'user' }]
      });

      if (!worker) {
        throw new Error('Worker not found');
      }

      const oldValue = worker.toJSON();
      worker.isActive = true;
      await worker.save();

      // Also activate user account
      worker.user.isActive = true;
      await worker.user.save();

      await authService.logAudit(
        worker.user.id,
        'UPDATE_WORKER',
        'Worker',
        worker.id,
        `Worker activated: ${worker.firstName} ${worker.lastName}`,
        ipAddress,
        userAgent,
        oldValue,
        worker.toJSON()
      );

      return worker;
    } catch (error) {
      throw error;
    }
  }

  async deleteWorker(workerId, ipAddress, userAgent) {
    try {
      const worker = await Worker.findByPk(workerId, {
        include: [{ model: User, as: 'user' }]
      });

      if (!worker) {
        throw new Error('Worker not found');
      }

      const oldValue = worker.toJSON();

      // Delete worker profile
      await worker.destroy();

      // Delete user account
      await worker.user.destroy();

      await authService.logAudit(
        worker.user.id,
        'DELETE_WORKER',
        'Worker',
        workerId,
        `Worker deleted: ${worker.firstName} ${worker.lastName}`,
        ipAddress,
        userAgent,
        oldValue,
        null
      );

      return { message: 'Worker deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  async getWorkerStatistics() {
    try {
      const stats = await Worker.findAll({
        attributes: [
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'total'],
          [require('sequelize').fn('COUNT', require('sequelize').literal("CASE WHEN isActive = true THEN 1 END")), 'active'],
          [require('sequelize').fn('COUNT', require('sequelize').literal("CASE WHEN isActive = false THEN 1 END")), 'inactive']
        ]
      });

      const result = stats[0].get({ plain: true });

      return {
        total: parseInt(result.total) || 0,
        active: parseInt(result.active) || 0,
        inactive: parseInt(result.inactive) || 0
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new WorkerService();
