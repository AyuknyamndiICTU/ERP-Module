const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Exam = sequelize.define('Exam', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
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
  examType: {
    type: DataTypes.ENUM('midterm', 'final', 'quiz', 'assignment', 'project', 'practical'),
    allowNull: false,
    field: 'exam_type'
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  examDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'exam_date'
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false,
    field: 'start_time'
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: false,
    field: 'end_time'
  },
  duration: {
    type: DataTypes.INTEGER, // Duration in minutes
    allowNull: false
  },
  totalMarks: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: false,
    field: 'total_marks',
    defaultValue: 100
  },
  passingMarks: {
    type: DataTypes.DECIMAL(6, 2),
    field: 'passing_marks'
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
  location: {
    type: DataTypes.STRING(100)
  },
  instructions: {
    type: DataTypes.TEXT
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'ongoing', 'completed', 'cancelled', 'postponed'),
    defaultValue: 'scheduled'
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    field: 'is_published',
    defaultValue: false
  },
  publishedAt: {
    type: DataTypes.DATE,
    field: 'published_at'
  },
  publishedBy: {
    type: DataTypes.INTEGER,
    field: 'published_by',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  allowLateSubmission: {
    type: DataTypes.BOOLEAN,
    field: 'allow_late_submission',
    defaultValue: false
  },
  lateSubmissionDeadline: {
    type: DataTypes.DATE,
    field: 'late_submission_deadline'
  },
  submissionInstructions: {
    type: DataTypes.TEXT,
    field: 'submission_instructions'
  }
}, {
  tableName: 'exams',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['course_id', 'exam_date']
    },
    {
      fields: ['exam_type', 'status']
    },
    {
      fields: ['academic_year', 'semester']
    }
  ]
});

module.exports = Exam;