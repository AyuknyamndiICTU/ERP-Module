const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  courseCode: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    field: 'course_code'
  },
  courseName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'course_name'
  },
  description: {
    type: DataTypes.TEXT
  },
  credits: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 6
    }
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false
  },
  semester: {
    type: DataTypes.STRING
  },
  academicYear: {
    type: DataTypes.STRING,
    field: 'academic_year'
  },
  maxEnrollment: {
    type: DataTypes.INTEGER,
    field: 'max_enrollment'
  },
  currentEnrollment: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'current_enrollment'
  },
  prerequisites: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  schedule: {
    type: DataTypes.JSONB
  },
  instructorId: {
    type: DataTypes.INTEGER,
    field: 'instructor_id',
    references: {
      model: 'users',
      key: 'id'
    }
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
