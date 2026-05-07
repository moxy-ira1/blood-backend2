module.exports = (sequelize, DataTypes) => {
  const Donor = sequelize.define('Donor', {
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
    donorId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other'),
      allowNull: false
    },
    bloodType: {
      type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
      allowNull: false
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false
    },
    idNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    eligibilityStatus: {
      type: DataTypes.ENUM('eligible', 'not_eligible', 'pending'),
      defaultValue: 'pending'
    },
    lastDonationDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    totalDonations: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    isRegisteredByWorker: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    registeredByWorkerId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'workers',
        key: 'id'
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'donors',
    timestamps: true
  });

  return Donor;
};
