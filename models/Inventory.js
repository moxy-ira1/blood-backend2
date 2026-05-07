module.exports = (sequelize, DataTypes) => {
  const Inventory = sequelize.define('Inventory', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    donationId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'donations',
        key: 'id'
      }
    },
    bloodType: {
      type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
      allowNull: false
    },
    quantityML: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    collectionDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    expiryDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('available', 'expired', 'discarded', 'used', 'quarantined'),
      allowNull: false,
      defaultValue: 'available'
    },
    storageLocation: {
      type: DataTypes.STRING,
      allowNull: true
    },
    storageTemperature: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true
    },
    batchNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    discardedReason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    discardedByWorkerId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'workers',
        key: 'id'
      }
    },
    usedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    usedFor: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'inventory',
    timestamps: true,
    hooks: {
      beforeCreate: (inventory) => {
        const expiryDays = parseInt(process.env.BLOOD_EXPIRY_DAYS) || 42;
        inventory.expiryDate = new Date(inventory.collectionDate.getTime() + (expiryDays * 24 * 60 * 60 * 1000));
      }
    }
  });

  return Inventory;
};
