const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Department = sequelize.define('Department', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  facultyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'faculty_id',
    references: {
      model: 'faculties',
      key: 'id'
    }
  },
  coordinatorId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'coordinator_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  }
}, {
  tableName: 'departments',
  timestamps: true,
  underscored: true
});

module.exports = Department;
