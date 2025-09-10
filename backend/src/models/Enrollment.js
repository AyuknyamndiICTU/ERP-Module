const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Enrollment = sequelize.define('Enrollment', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
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
  semester: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 2
    }
  },
  academicYear: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'academic_year'
  },
  enrollmentDate: {
    type: DataTypes.DATEONLY,
    field: 'enrollment_date',
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('enrolled', 'withdrawn', 'completed', 'failed', 'in_progress'),
    defaultValue: 'enrolled'
  },
  finalGrade: {
    type: DataTypes.STRING(5),
    field: 'final_grade'
  },
  gradePoints: {
    type: DataTypes.DECIMAL(3, 2),
    field: 'grade_points'
  },
  creditsEarned: {
    type: DataTypes.INTEGER,
    field: 'credits_earned',
    defaultValue: 0
  },
  withdrawalDate: {
    type: DataTypes.DATEONLY,
    field: 'withdrawal_date'
  },
  withdrawalReason: {
    type: DataTypes.TEXT,
    field: 'withdrawal_reason'
  },
  isAudit: {
    type: DataTypes.BOOLEAN,
    field: 'is_audit',
    defaultValue: false
  }
}, {
  tableName: 'enrollments',
  timestamps: true,
  underscored: true
});

module.exports = Enrollment;