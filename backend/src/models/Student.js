const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  matricule: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    field: 'matricule'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'first_name'
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'last_name'
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    field: 'date_of_birth'
  },
  regionOfOrigin: {
    type: DataTypes.STRING,
    field: 'region_of_origin'
  },
  placeOfOrigin: {
    type: DataTypes.STRING,
    field: 'place_of_origin'
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other')
  },
  age: {
    type: DataTypes.INTEGER
  },
  bloodGroup: {
    type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
    field: 'blood_group'
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
  semester: {
    type: DataTypes.INTEGER,
    validate: {
      min: 1,
      max: 2
    }
  },
  studentType: {
    type: DataTypes.ENUM('regular', 'transfer'),
    defaultValue: 'regular',
    field: 'student_type'
  },
  level: {
    type: DataTypes.INTEGER,
    validate: {
      min: 1,
      max: 4
    }
  },
  enrollmentDate: {
    type: DataTypes.DATEONLY,
    field: 'enrollment_date'
  },
  registrationYear: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'registration_year'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'graduated', 'suspended', 'registered', 'pending'),
    defaultValue: 'pending'
  },
  registrationLocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'registration_locked'
  },
  gpa: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0.00
  },
  totalCredits: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'total_credits'
  }
}, {
  tableName: 'students',
  timestamps: true,
  underscored: true
});

module.exports = Student;
