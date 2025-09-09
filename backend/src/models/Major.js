const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Major = sequelize.define('Major', {
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
    allowNull: false,
    unique: true
  },
  level: {
    type: DataTypes.ENUM('undergraduate', 'masters', 'phd'),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
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
  tableName: 'majors',
  timestamps: true,
  underscored: true
});

module.exports = Major;
