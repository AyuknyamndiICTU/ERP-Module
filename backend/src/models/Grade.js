const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Grade = sequelize.define('Grade', {
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
  caMarks: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    field: 'ca_marks',
    validate: {
      min: 0,
      max: 30
    }
  },
  examMarks: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    field: 'exam_marks',
    validate: {
      min: 0,
      max: 70
    }
  },
  totalMarks: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    field: 'total_marks',
    validate: {
      min: 0,
      max: 100
    }
  },
  letterGrade: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'letter_grade'
  },
  gradePoints: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    field: 'grade_points',
    validate: {
      min: 0,
      max: 4
    }
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'locked'),
    defaultValue: 'draft'
  },
  publishedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'published_at'
  },
  publishedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'published_by',
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'grades',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeSave: (grade) => {
      // Calculate total marks if both CA and exam marks are present
      if (grade.caMarks !== null && grade.examMarks !== null) {
        grade.totalMarks = parseFloat(grade.caMarks) + parseFloat(grade.examMarks);
        
        // Calculate letter grade and grade points based on total marks
        const total = grade.totalMarks;
        if (total >= 80) {
          grade.letterGrade = 'A';
          grade.gradePoints = 4.0;
        } else if (total >= 75) {
          grade.letterGrade = 'B+';
          grade.gradePoints = 3.5;
        } else if (total >= 70) {
          grade.letterGrade = 'B';
          grade.gradePoints = 3.0;
        } else if (total >= 65) {
          grade.letterGrade = 'C+';
          grade.gradePoints = 2.5;
        } else if (total >= 60) {
          grade.letterGrade = 'C';
          grade.gradePoints = 2.0;
        } else if (total >= 55) {
          grade.letterGrade = 'D+';
          grade.gradePoints = 1.5;
        } else if (total >= 50) {
          grade.letterGrade = 'D';
          grade.gradePoints = 1.0;
        } else {
          grade.letterGrade = 'F';
          grade.gradePoints = 0.0;
        }
      }
    }
  }
});

module.exports = Grade;
