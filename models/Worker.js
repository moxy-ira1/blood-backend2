module.exports = (sequelize, DataTypes) => {
  const Worker = sequelize.define('Worker', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    btdId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'btds',
        key: 'id'
      }
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    employeeId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    position: {
      type: DataTypes.STRING,
      allowNull: false
    },
    department: {
      type: DataTypes.STRING,
      allowNull: true
    },
    qualifications: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    hireDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'workers',
    timestamps: true
  });

  return Worker;
};
