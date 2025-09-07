const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Employee = sequelize.define('Employee', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  employeeId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    field: 'employee_id'
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
  department: {
    type: DataTypes.STRING,
    allowNull: false
  },
  position: {
    type: DataTypes.STRING,
    allowNull: false
  },
  hireDate: {
    type: DataTypes.DATEONLY,
    field: 'hire_date'
  },
  salary: {
    type: DataTypes.DECIMAL(10, 2)
  },
  employmentType: {
    type: DataTypes.ENUM('full-time', 'part-time', 'contract', 'intern'),
    field: 'employment_type',
    defaultValue: 'full-time'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'terminated', 'on-leave'),
    defaultValue: 'active'
  },
  managerId: {
    type: DataTypes.INTEGER,
    field: 'manager_id',
    references: {
      model: 'employees',
      key: 'id'
    }
  },
  address: {
    type: DataTypes.JSONB
  },
  emergencyContact: {
    type: DataTypes.JSONB,
    field: 'emergency_contact'
  }
}, {
  tableName: 'employees',
  timestamps: true,
  underscored: true
});

module.exports = Employee;
