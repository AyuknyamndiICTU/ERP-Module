const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FeeStructure = sequelize.define('FeeStructure', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  academicYear: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'academic_year'
  },
  semester: {
    type: DataTypes.STRING
  },
  program: {
    type: DataTypes.STRING
  },
  feeComponents: {
    type: DataTypes.JSONB,
    allowNull: false,
    field: 'fee_components'
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'total_amount'
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    field: 'due_date'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'archived'),
    defaultValue: 'active'
  }
}, {
  tableName: 'fee_structures',
  timestamps: true,
  underscored: true
});

module.exports = FeeStructure;
