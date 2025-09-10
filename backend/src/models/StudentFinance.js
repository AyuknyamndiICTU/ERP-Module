const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const StudentFinance = sequelize.define('StudentFinance', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    field: 'student_id',
    references: {
      model: 'students',
      key: 'id'
    }
  },
  totalFeeAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    field: 'total_fee_amount',
    validate: {
      min: 0
    }
  },
  totalPaidAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    field: 'total_paid_amount',
    validate: {
      min: 0
    }
  },
  outstandingAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    field: 'outstanding_amount',
    validate: {
      min: 0
    }
  },
  paymentStatus: {
    type: DataTypes.ENUM('cleared', 'partial', 'outstanding', 'blocked'),
    defaultValue: 'outstanding',
    field: 'payment_status'
  },
  isBlocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_blocked'
  },
  blockReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'block_reason'
  },
  blockedDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'blocked_date'
  },
  blockedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'blocked_by',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  lastPaymentDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_payment_date'
  },
  nextDueDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'next_due_date'
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
  installmentPlan: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'installment_plan',
    defaultValue: {
      totalInstallments: 1,
      installmentAmount: 0,
      frequency: 'semester' // semester, monthly, quarterly
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'student_finance',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeSave: async (studentFinance) => {
      // Calculate outstanding amount
      studentFinance.outstandingAmount = studentFinance.totalFeeAmount - studentFinance.totalPaidAmount;
      
      // Update payment status
      if (studentFinance.outstandingAmount <= 0) {
        studentFinance.paymentStatus = 'cleared';
        studentFinance.isBlocked = false;
      } else if (studentFinance.totalPaidAmount > 0) {
        studentFinance.paymentStatus = 'partial';
      } else {
        studentFinance.paymentStatus = 'outstanding';
      }
      
      // Auto-block if overdue by more than 30 days
      if (studentFinance.nextDueDate && new Date() > new Date(studentFinance.nextDueDate.getTime() + 30 * 24 * 60 * 60 * 1000)) {
        if (!studentFinance.isBlocked) {
          studentFinance.isBlocked = true;
          studentFinance.paymentStatus = 'blocked';
          studentFinance.blockReason = 'Automatic block due to overdue payment (30+ days)';
          studentFinance.blockedDate = new Date();
        }
      }
    }
  }
});

// Define associations
StudentFinance.associate = (models) => {
  StudentFinance.belongsTo(models.Student, {
    foreignKey: 'studentId',
    as: 'student'
  });
  
  StudentFinance.belongsTo(models.User, {
    foreignKey: 'blockedBy',
    as: 'blocker'
  });
  
  StudentFinance.hasMany(models.FeeInstallment, {
    foreignKey: 'studentId',
    as: 'installments'
  });
};

module.exports = StudentFinance;
