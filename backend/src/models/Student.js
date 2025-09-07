const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  studentId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    field: 'student_id'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'first_name'
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'last_name'
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    field: 'date_of_birth'
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other')
  },
  address: {
    type: DataTypes.JSONB
  },
  programId: {
    type: DataTypes.INTEGER,
    field: 'program_id'
  },
  yearLevel: {
    type: DataTypes.INTEGER,
    field: 'year_level',
    validate: {
      min: 1,
      max: 4
    }
  },
  enrollmentDate: {
    type: DataTypes.DATEONLY,
    field: 'enrollment_date'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'graduated', 'suspended'),
    defaultValue: 'active'
  },
  gpa: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0.00
  },
  totalCredits: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'total_credits'
  }
}, {
  tableName: 'students',
  timestamps: true,
  underscored: true
});

module.exports = Student;
