module.exports = (sequelize, DataTypes) => {
  const BloodTest = sequelize.define('BloodTest', {
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
    testDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    hivResult: {
      type: DataTypes.ENUM('positive', 'negative', 'pending'),
      allowNull: false,
      defaultValue: 'pending'
    },
    hepatitisBResult: {
      type: DataTypes.ENUM('positive', 'negative', 'pending'),
      allowNull: false,
      defaultValue: 'pending'
    },
    hepatitisCResult: {
      type: DataTypes.ENUM('positive', 'negative', 'pending'),
      allowNull: false,
      defaultValue: 'pending'
    },
    malariaResult: {
      type: DataTypes.ENUM('positive', 'negative', 'pending'),
      allowNull: false,
      defaultValue: 'pending'
    },
    hemoglobinLevel: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true
    },
    hemoglobinResult: {
      type: DataTypes.ENUM('normal', 'low', 'pending'),
      allowNull: false,
      defaultValue: 'pending'
    },
    overallResult: {
      type: DataTypes.ENUM('eligible', 'not_eligible', 'pending'),
      allowNull: false,
      defaultValue: 'pending'
    },
    testedByWorkerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'workers',
        key: 'id'
      }
    },
    testNotes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isCompleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'blood_tests',
    timestamps: true
  });

  return BloodTest;
};
