const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Faculty = sequelize.define('Faculty', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
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
  tableName: 'faculties',
  timestamps: true,
  underscored: true
});

module.exports = Faculty;
