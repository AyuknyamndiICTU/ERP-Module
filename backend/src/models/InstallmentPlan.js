const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const InstallmentPlan = sequelize.define('InstallmentPlan', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  studentId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'student_id',
    references: {
      model: 'students',
      key: 'id'
    }
  },
  feeStructureId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'fee_structure_id',
    references: {
      model: 'fee_structures',
      key: 'id'
    }
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'total_amount'
  },
  numberOfInstallments: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 3,
    field: 'number_of_installments'
  },
  installmentAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'installment_amount'
  },
  remainingAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    field: 'remaining_amount'
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'start_date'
  },
  frequency: {
    type: DataTypes.ENUM('monthly', 'quarterly', 'custom'),
    defaultValue: 'monthly'
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'overdue', 'cancelled'),
    defaultValue: 'active'
  },
  customSchedule: {
    type: DataTypes.JSONB,
    field: 'custom_schedule',
    comment: 'Custom installment dates and amounts'
  },
  notes: {
    type: DataTypes.TEXT
  },
  createdBy: {
    type: DataTypes.UUID,
    field: 'created_by',
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'installment_plans',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['student_id']
    },
    {
      fields: ['fee_structure_id']
    },
    {
      fields: ['status']
    }
  ]
});

module.exports = InstallmentPlan;
