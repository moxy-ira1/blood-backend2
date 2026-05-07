module.exports = (sequelize, DataTypes) => {
  const AuthMethod = sequelize.define('AuthMethod', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    donorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'donors',
        key: 'id'
      }
    },
    method: {
      type: DataTypes.ENUM('id_number', 'phone', 'email'),
      allowNull: false
    },
    identifier: {
      type: DataTypes.STRING,
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    lastUsed: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'auth_methods',
    timestamps: true
  });

  return AuthMethod;
};
