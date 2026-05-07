module.exports = (sequelize, DataTypes) => {
  const AuditLog = sequelize.define('AuditLog', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    action: {
      type: DataTypes.ENUM('CREATE_DONATION', 'CREATE_BLOOD_TEST', 'UPDATE_USER', 'INVENTORY_UPDATE', 'CREATE_MESSAGE', 'CREATE_NOTIFICATION', 'LOGIN', 'LOGOUT', 'DELETE_DONATION', 'UPDATE_DONOR', 'CREATE_WORKER', 'UPDATE_WORKER', 'DELETE_WORKER'),
      allowNull: false
    },
    entityType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    entityId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    oldValue: {
      type: DataTypes.JSON,
      allowNull: true
    },
    newValue: {
      type: DataTypes.JSON,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('success', 'failure', 'warning'),
      allowNull: false,
      defaultValue: 'success'
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'audit_logs',
    timestamps: true
  });

  return AuditLog;
};
