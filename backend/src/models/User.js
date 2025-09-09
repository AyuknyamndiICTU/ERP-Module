const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
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
  resetToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  resetTokenExpiry: {
    type: DataTypes.DATE,
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM(
      'admin', 
      'system_admin', 
      'student', 
      'lecturer', 
      'faculty_coordinator', 
      'major_coordinator', 
      'finance_staff', 
      'hr_staff', 
      'marketing_staff', 
      'employee'
    ),
    allowNull: false,
    defaultValue: 'student'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  lastLogin: {
    type: DataTypes.DATE,
    field: 'last_login'
  },
  coordinatorType: {
    type: DataTypes.ENUM('faculty', 'major', 'department'),
    allowNull: true,
    field: 'coordinator_type'
  },
  coordinatorEntityId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'coordinator_entity_id'
  }
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true
});

module.exports = User;
