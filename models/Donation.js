module.exports = (sequelize, DataTypes) => {
  const Donation = sequelize.define('Donation', {
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
    donationDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    bloodType: {
      type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
      allowNull: false
    },
    quantityML: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 450
    },
    donationType: {
      type: DataTypes.ENUM('whole_blood', 'plasma', 'platelets', 'red_blood_cells'),
      allowNull: false,
      defaultValue: 'whole_blood'
    },
    bloodPressure: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: { systolic: null, diastolic: null }
    },
    pulse: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    temperature: {
      type: DataTypes.DECIMAL(4, 1),
      allowNull: true
    },
    weight: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true
    },
    hemoglobinLevel: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true
    },
    donationStatus: {
      type: DataTypes.ENUM('completed', 'in_progress', 'cancelled', 'deferred'),
      allowNull: false,
      defaultValue: 'completed'
    },
    collectedByWorkerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'workers',
        key: 'id'
      }
    },
    donationNotes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    adverseReaction: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isEligibleBeforeDonation: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  }, {
    tableName: 'donations',
    timestamps: true
  });

  return Donation;
};
