const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  credits: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 3
  },
  semester: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 2
    }
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 4
    }
  },
  departmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'department_id',
    references: {
      model: 'departments',
      key: 'id'
    }
  },
  majorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'major_id',
    references: {
      model: 'majors',
      key: 'id'
    }
  },
  lecturerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'lecturer_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  prerequisites: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  schedule: {
    type: DataTypes.JSONB
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'completed'),
    defaultValue: 'active'
  }
}, {
  tableName: 'courses',
  timestamps: true,
  underscored: true
});

module.exports = Course;
