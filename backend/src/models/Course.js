const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    field: 'id'
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
    type: DataTypes.TEXT,
    field: 'description'
  },
  credits: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 3,
    field: 'credits'
  },
  semester: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'semester'
  },
  academicYear: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'academic_year'
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'department'
  },
  maxEnrollment: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 30,
    field: 'max_enrollment'
  },
  currentEnrollment: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'current_enrollment'
  },
  instructorId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'instructor_id'
  },
  prerequisites: {
    type: DataTypes.JSONB,
    defaultValue: [],
    field: 'prerequisites'
  },
  schedule: {
    type: DataTypes.JSONB,
    field: 'schedule'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'completed'),
    defaultValue: 'active',
    field: 'status'
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    field: 'updated_at'
  }
}, {
  tableName: 'courses',
  timestamps: true,
  underscored: true,
  sync: false,
  freezeTableName: true,
  // Disable automatic field discovery
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  }
});

module.exports = Course;
