module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'donors',
        key: 'id'
      }
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('donation_success', 'blood_test_result', 'eligibility_change', 'blood_expiry', 'system_alert', 'reminder'),
      allowNull: false
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      defaultValue: 'medium'
    },
    actionRequired: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    actionUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    relatedEntityId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    relatedEntityType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    scheduledFor: {
      type: DataTypes.DATE,
      allowNull: true
    },
    sentAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'notifications',
    timestamps: true
  });

  return Notification;
};
