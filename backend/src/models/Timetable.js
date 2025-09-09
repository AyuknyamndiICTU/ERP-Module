const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Timetable = sequelize.define('Timetable', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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
  facultyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'faculty_id',
    references: {
      model: 'faculties',
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
  dayOfWeek: {
    type: DataTypes.ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'),
    allowNull: false,
    field: 'day_of_week'
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
  lecturerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'lecturer_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  hall: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'TBA'
  },
  isOnline: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_online'
  },
  status: {
    type: DataTypes.ENUM('active', 'cancelled', 'rescheduled'),
    defaultValue: 'active'
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'timetables',
  timestamps: true,
  underscored: true
});

module.exports = Timetable;
