const User = require('./User');
const Student = require('./Student');
const Course = require('./Course');
const Employee = require('./Employee');
const FeeStructure = require('./FeeStructure');
const Faculty = require('./Faculty');
const Department = require('./Department');
const Major = require('./Major');
const Grade = require('./Grade');
const FeeInstallment = require('./FeeInstallment');
const StudentFinance = require('./StudentFinance');
const Notification = require('./Notification');
const Complaint = require('./Complaint');
const Timetable = require('./Timetable');
const Enrollment = require('./Enrollment');
const Attendance = require('./Attendance');
const Exam = require('./Exam');

// User associations
User.hasOne(Student, { foreignKey: 'userId', as: 'studentProfile' });
User.hasOne(Employee, { foreignKey: 'userId', as: 'employeeProfile' });
User.hasMany(Course, { foreignKey: 'instructorId', as: 'courses' });
User.hasMany(Grade, { foreignKey: 'publishedBy', as: 'publishedGrades' });
User.hasMany(Notification, { foreignKey: 'recipientId', as: 'receivedNotifications' });
User.hasMany(Notification, { foreignKey: 'senderId', as: 'sentNotifications' });
User.hasMany(Complaint, { foreignKey: 'studentId', as: 'complaints' });
User.hasMany(Complaint, { foreignKey: 'handlerId', as: 'handledComplaints' });

// Student associations
Student.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Student.belongsTo(Faculty, { foreignKey: 'facultyId', as: 'faculty' });
Student.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });
Student.belongsTo(Major, { foreignKey: 'majorId', as: 'major' });
Student.hasMany(Grade, { foreignKey: 'studentId', as: 'grades' });
Student.hasMany(FeeInstallment, { foreignKey: 'studentId', as: 'installments' });
Student.hasOne(StudentFinance, { foreignKey: 'studentId', as: 'finance' });
Student.hasMany(Complaint, { foreignKey: 'studentId', as: 'complaints' });
Student.hasMany(Enrollment, { foreignKey: 'studentId', as: 'enrollments' });
Student.hasMany(Attendance, { foreignKey: 'studentId', as: 'attendance' });

// Course associations (removed due to schema mismatch)

// Employee associations
Employee.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Employee.belongsTo(Employee, { foreignKey: 'managerId', as: 'manager' });
Employee.hasMany(Employee, { foreignKey: 'managerId', as: 'subordinates' });

// Faculty associations
Faculty.hasMany(Department, { foreignKey: 'facultyId', as: 'departments' });
Faculty.hasMany(Student, { foreignKey: 'facultyId', as: 'students' });
Faculty.belongsTo(User, { foreignKey: 'coordinatorId', as: 'coordinator' });

// Department associations
Department.belongsTo(Faculty, { foreignKey: 'facultyId', as: 'faculty' });
Department.hasMany(Major, { foreignKey: 'departmentId', as: 'majors' });
//Department.hasMany(Course, { foreignKey: 'departmentId', as: 'courses' });
Department.hasMany(Student, { foreignKey: 'departmentId', as: 'students' });
Department.belongsTo(User, { foreignKey: 'coordinatorId', as: 'coordinator' });

// Major associations
Major.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });
//Major.hasMany(Course, { foreignKey: 'majorId', as: 'courses' });
Major.hasMany(Student, { foreignKey: 'majorId', as: 'students' });
Major.belongsTo(User, { foreignKey: 'coordinatorId', as: 'coordinator' });

// Grade associations
Grade.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
Grade.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });
Grade.belongsTo(User, { foreignKey: 'lecturerId', as: 'lecturer' });
Grade.belongsTo(User, { foreignKey: 'publishedBy', as: 'publisher' });

// Fee Structure associations
FeeStructure.hasMany(FeeInstallment, { foreignKey: 'feeStructureId', as: 'installments' });

// Fee Installment associations
FeeInstallment.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
FeeInstallment.belongsTo(FeeStructure, { foreignKey: 'feeStructureId', as: 'feeStructure' });
FeeInstallment.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// Student Finance associations
StudentFinance.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
StudentFinance.hasMany(FeeInstallment, { foreignKey: 'studentId', as: 'installments' });
StudentFinance.belongsTo(User, { foreignKey: 'blockedBy', as: 'blocker' });

// Notification associations
Notification.belongsTo(User, { foreignKey: 'recipientId', as: 'recipient' });
Notification.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

// Complaint associations
Complaint.belongsTo(User, { foreignKey: 'studentId', as: 'student' });
Complaint.belongsTo(User, { foreignKey: 'handlerId', as: 'handler' });

// Timetable associations
Timetable.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });
Timetable.belongsTo(User, { foreignKey: 'lecturerId', as: 'lecturer' });

// Enrollment associations
Enrollment.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
Enrollment.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// Attendance associations
Attendance.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
Attendance.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });
Attendance.belongsTo(User, { foreignKey: 'lecturerId', as: 'lecturer' });
Attendance.belongsTo(User, { foreignKey: 'markedBy', as: 'markedByUser' });

// Exam associations
Exam.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });
Exam.belongsTo(User, { foreignKey: 'lecturerId', as: 'lecturer' });
Exam.belongsTo(User, { foreignKey: 'publishedBy', as: 'publisher' });

module.exports = {
  User,
  Student,
  Course,
  Employee,
  FeeStructure,
  Faculty,
  Department,
  Major,
  Grade,
  FeeInstallment,
  StudentFinance,
  Notification,
  Complaint,
  Timetable,
  Enrollment,
  Attendance,
  Exam
};
