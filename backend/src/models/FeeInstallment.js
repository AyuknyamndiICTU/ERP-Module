const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FeeInstallment = sequelize.define('FeeInstallment', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'student_id',
    references: {
      model: 'students',
      key: 'id'
    }
  },
  academicYear: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'academic_year'
  },
  semester: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 8
    }
  },
  installmentNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'installment_number'
  },
  totalInstallments: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'total_installments'
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'due_date'
  },
  paidAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    field: 'paid_amount',
    validate: {
      min: 0
    }
  },
  paidDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'paid_date'
  },
  status: {
    type: DataTypes.ENUM('pending', 'partial', 'paid', 'overdue', 'waived'),
    defaultValue: 'pending'
  },
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'bank_transfer', 'mobile_money', 'card', 'cheque'),
    allowNull: true,
    field: 'payment_method'
  },
  transactionReference: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'transaction_reference'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'created_by',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  updatedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'updated_by',
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'fee_installments',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeSave: async (installment) => {
      // Update status based on payment
      if (installment.paidAmount >= installment.amount) {
        installment.status = 'paid';
        if (!installment.paidDate) {
          installment.paidDate = new Date();
        }
      } else if (installment.paidAmount > 0) {
        installment.status = 'partial';
      } else if (new Date() > installment.dueDate) {
        installment.status = 'overdue';
      }
    }
  }
});

// Define associations
FeeInstallment.associate = (models) => {
  FeeInstallment.belongsTo(models.Student, {
    foreignKey: 'studentId',
    as: 'student'
  });
  
  FeeInstallment.belongsTo(models.User, {
    foreignKey: 'createdBy',
    as: 'creator'
  });
  
  FeeInstallment.belongsTo(models.User, {
    foreignKey: 'updatedBy',
    as: 'updater'
  });
};

module.exports = FeeInstallment;
