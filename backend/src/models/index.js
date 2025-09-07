const User = require('./User');
const Student = require('./Student');
const Course = require('./Course');
const Employee = require('./Employee');
const FeeStructure = require('./FeeStructure');

// Define associations
User.hasOne(Student, { foreignKey: 'userId', as: 'studentProfile' });
Student.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasOne(Employee, { foreignKey: 'userId', as: 'employeeProfile' });
Employee.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Course.belongsTo(User, { foreignKey: 'instructorId', as: 'instructor' });
User.hasMany(Course, { foreignKey: 'instructorId', as: 'courses' });

Employee.belongsTo(Employee, { foreignKey: 'managerId', as: 'manager' });
Employee.hasMany(Employee, { foreignKey: 'managerId', as: 'subordinates' });

module.exports = {
  User,
  Student,
  Course,
  Employee,
  FeeStructure
};
