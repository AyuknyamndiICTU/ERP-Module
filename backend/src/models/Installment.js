const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Installment = sequelize.define('Installment', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  installmentPlanId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'installment_plan_id',
    references: {
      model: 'installment_plans',
      key: 'id'
    }
  },
  installmentNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'installment_number'
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'due_date'
  },
  paidAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    field: 'paid_amount'
  },
  paidDate: {
    type: DataTypes.DATEONLY,
    field: 'paid_date'
  },
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'overdue', 'partial', 'waived'),
    defaultValue: 'pending'
  },
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'bank_transfer', 'mobile_money', 'cheque', 'online'),
    field: 'payment_method'
  },
  transactionReference: {
    type: DataTypes.STRING,
    field: 'transaction_reference'
  },
  lateFee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    field: 'late_fee'
  },
  discount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  notes: {
    type: DataTypes.TEXT
  },
  processedBy: {
    type: DataTypes.UUID,
    field: 'processed_by',
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'installments',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['installment_plan_id']
    },
    {
      fields: ['due_date']
    },
    {
      fields: ['status']
    },
    {
      unique: true,
      fields: ['installment_plan_id', 'installment_number']
    }
  ]
});

module.exports = Installment;
