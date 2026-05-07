const { User, Donor, Worker, BTD, AuthMethod } = require('../models');
const authService = require('./authService');
const bcrypt = require('bcryptjs');

class UserService {
  async createUser(userData, ipAddress, userAgent) {
    try {
      const { email, password, phone, role, ...profileData } = userData;

      // Check if user already exists
      const existingUser = await User.findOne({
        where: {
          [require('sequelize').Op.or]: [
            email ? { email } : null,
            phone ? { phone } : null
          ].filter(Boolean)
        }
      });

      if (existingUser) {
        throw new Error('User with this email or phone already exists');
      }

      // Create user
      const user = await User.create({
        email,
        password,
        phone,
        role
      });

      // Create profile based on role
      let profile = null;
      if (role === 'owner') {
        profile = await BTD.create({
          userId: user.id,
          ...profileData
        });
      } else if (role === 'worker') {
        profile = await Worker.create({
          userId: user.id,
          ...profileData
        });
      } else if (role === 'donor') {
        profile = await Donor.create({
          userId: user.id,
          ...profileData
        });

        // Create auth method for donor
        if (profileData.idNumber) {
          await AuthMethod.create({
            donorId: profile.id,
            method: 'id_number',
            identifier: profileData.idNumber
          });
        }
      }

      await authService.logAudit(
        user.id,
        'CREATE_USER',
        'User',
        user.id,
        `User created with role: ${role}`,
        ipAddress,
        userAgent,
        null,
        user.toJSON()
      );

      return { user, profile };
    } catch (error) {
      throw error;
    }
  }

  async updateUser(userId, updateData, ipAddress, userAgent) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const oldValue = user.toJSON();
      
      // Handle password update
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 12);
      }

      await user.update(updateData);

      await authService.logAudit(
        userId,
        'UPDATE_USER',
        'User',
        user.id,
        'User profile updated',
        ipAddress,
        userAgent,
        oldValue,
        user.toJSON()
      );

      return user;
    } catch (error) {
      throw error;
    }
  }

  async getUserById(userId) {
    try {
      const user = await User.findByPk(userId, {
        attributes: { exclude: ['password'] },
        include: [
          { model: BTD, as: 'btd' },
          { model: Worker, as: 'worker', include: [{ model: BTD, as: 'btd' }] },
          { model: Donor, as: 'donor' }
        ]
      });

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  async getAllUsers(options = {}) {
    try {
      const { page = 1, limit = 10, role, isActive } = options;
      const offset = (page - 1) * limit;

      const whereClause = {};
      if (role) {
        whereClause.role = role;
      }
      if (isActive !== undefined) {
        whereClause.isActive = isActive === 'true';
      }

      const { count, rows } = await User.findAndCountAll({
        where: whereClause,
        attributes: { exclude: ['password'] },
        include: [
          { model: BTD, as: 'btd' },
          { model: Worker, as: 'worker', include: [{ model: BTD, as: 'btd' }] },
          { model: Donor, as: 'donor' }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      return {
        users: rows,
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

  async deactivateUser(userId, ipAddress, userAgent) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const oldValue = user.toJSON();
      user.isActive = false;
      await user.save();

      await authService.logAudit(
        userId,
        'UPDATE_USER',
        'User',
        user.id,
        'User deactivated',
        ipAddress,
        userAgent,
        oldValue,
        user.toJSON()
      );

      return user;
    } catch (error) {
      throw error;
    }
  }

  async activateUser(userId, ipAddress, userAgent) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const oldValue = user.toJSON();
      user.isActive = true;
      await user.save();

      await authService.logAudit(
        userId,
        'UPDATE_USER',
        'User',
        user.id,
        'User activated',
        ipAddress,
        userAgent,
        oldValue,
        user.toJSON()
      );

      return user;
    } catch (error) {
      throw error;
    }
  }

  async getUserStatistics() {
    try {
      const stats = await User.findAll({
        attributes: [
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'total'],
          [require('sequelize').fn('COUNT', require('sequelize').literal("CASE WHEN role = 'owner' THEN 1 END")), 'owners'],
          [require('sequelize').fn('COUNT', require('sequelize').literal("CASE WHEN role = 'worker' THEN 1 END")), 'workers'],
          [require('sequelize').fn('COUNT', require('sequelize').literal("CASE WHEN role = 'donor' THEN 1 END")), 'donors'],
          [require('sequelize').fn('COUNT', require('sequelize').literal("CASE WHEN isActive = true THEN 1 END")), 'active'],
          [require('sequelize').fn('COUNT', require('sequelize').literal("CASE WHEN isActive = false THEN 1 END")), 'inactive']
        ]
      });

      const result = stats[0].get({ plain: true });

      return {
        total: parseInt(result.total) || 0,
        owners: parseInt(result.owners) || 0,
        workers: parseInt(result.workers) || 0,
        donors: parseInt(result.donors) || 0,
        active: parseInt(result.active) || 0,
        inactive: parseInt(result.inactive) || 0
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new UserService();
