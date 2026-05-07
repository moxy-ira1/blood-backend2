const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Use DATABASE_URL for production (Render), otherwise use individual config
const sequelize = process.env.DATABASE_URL 
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: dbConfig.logging,
      dialectOptions: dbConfig.dialectOptions,
      pool: dbConfig.pool
    })
  : new Sequelize(
      dbConfig.database || 'blood_bank',
      dbConfig.username || null,
      dbConfig.password || null,
      {
        host: dbConfig.host || null,
        dialect: dbConfig.dialect,
        logging: dbConfig.logging,
        storage: dbConfig.storage || './database.sqlite'
      }
    );

const User = require('./User')(sequelize, Sequelize.DataTypes);
const BTD = require('./BTD')(sequelize, Sequelize.DataTypes);
const Worker = require('./Worker')(sequelize, Sequelize.DataTypes);
const Donor = require('./Donor')(sequelize, Sequelize.DataTypes);
const AuthMethod = require('./AuthMethod')(sequelize, Sequelize.DataTypes);
const BloodTest = require('./BloodTest')(sequelize, Sequelize.DataTypes);
const Donation = require('./Donation')(sequelize, Sequelize.DataTypes);
const Inventory = require('./Inventory')(sequelize, Sequelize.DataTypes);
const Message = require('./Message')(sequelize, Sequelize.DataTypes);
const Notification = require('./Notification')(sequelize, Sequelize.DataTypes);
const AuditLog = require('./AuditLog')(sequelize, Sequelize.DataTypes);

// Define associations
const models = {
  User,
  BTD,
  Worker,
  Donor,
  AuthMethod,
  BloodTest,
  Donation,
  Inventory,
  Message,
  Notification,
  AuditLog
};

// User associations
User.hasOne(BTD, { foreignKey: 'userId', as: 'btd' });
User.hasOne(Worker, { foreignKey: 'userId', as: 'worker' });
User.hasOne(Donor, { foreignKey: 'userId', as: 'donor' });

BTD.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Worker.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Donor.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// BTD-Worker associations
BTD.hasMany(Worker, { foreignKey: 'btdId', as: 'workers' });
Worker.belongsTo(BTD, { foreignKey: 'btdId', as: 'btd' });

// Donor associations
Donor.hasMany(BloodTest, { foreignKey: 'donorId', as: 'bloodTests' });
Donor.hasMany(Donation, { foreignKey: 'donorId', as: 'donations' });
Donor.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
Donor.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });
Donor.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });

BloodTest.belongsTo(Donor, { foreignKey: 'donorId', as: 'donor' });
Donation.belongsTo(Donor, { foreignKey: 'donorId', as: 'donor' });

// Donation-Inventory associations
Donation.hasOne(Inventory, { foreignKey: 'donationId', as: 'inventory' });
Inventory.belongsTo(Donation, { foreignKey: 'donationId', as: 'donation' });

// Message associations
Message.belongsTo(Donor, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(Donor, { foreignKey: 'receiverId', as: 'receiver' });

// Notification associations
Notification.belongsTo(Donor, { foreignKey: 'userId', as: 'user' });

// AuditLog associations
AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// AuthMethod associations
Donor.hasOne(AuthMethod, { foreignKey: 'donorId', as: 'authMethod' });
AuthMethod.belongsTo(Donor, { foreignKey: 'donorId', as: 'donor' });

module.exports = {
  sequelize,
  ...models
};
