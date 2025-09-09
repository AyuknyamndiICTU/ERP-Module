const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Complaint = sequelize.define('Complaint', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'student_id',
    references: {
      model: 'students',
      key: 'id'
    }
  },
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'course_id',
    references: {
      model: 'courses',
      key: 'id'
    }
  },
  lecturerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'lecturer_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  attachments: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  status: {
    type: DataTypes.ENUM('pending', 'under_review', 'resolved', 'rejected'),
    defaultValue: 'pending'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium'
  },
  response: {
    type: DataTypes.TEXT
  },
  respondedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'responded_by',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  respondedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'responded_at'
  },
  resolvedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'resolved_at'
  }
}, {
  tableName: 'complaints',
  timestamps: true,
  underscored: true
});

module.exports = Complaint;
