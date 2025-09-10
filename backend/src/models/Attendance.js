const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Attendance = sequelize.define('Attendance', {
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
  lecturerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'lecturer_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  attendanceDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'attendance_date'
  },
  status: {
    type: DataTypes.ENUM('present', 'absent', 'late', 'excused'),
    allowNull: false,
    defaultValue: 'present'
  },
  checkInTime: {
    type: DataTypes.TIME,
    field: 'check_in_time'
  },
  checkOutTime: {
    type: DataTypes.TIME,
    field: 'check_out_time'
  },
  duration: {
    type: DataTypes.INTEGER, // Duration in minutes
    allowNull: true
  },
  location: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
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
  isExcused: {
    type: DataTypes.BOOLEAN,
    field: 'is_excused',
    defaultValue: false
  },
  excuseReason: {
    type: DataTypes.TEXT,
    field: 'excuse_reason'
  },
  markedBy: {
    type: DataTypes.INTEGER,
    field: 'marked_by',
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'attendance',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['student_id', 'course_id', 'attendance_date']
    },
    {
      fields: ['course_id', 'attendance_date']
    },
    {
      fields: ['student_id', 'academic_year', 'semester']
    }
  ]
});

module.exports = Attendance;