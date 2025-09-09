const { sequelize } = require('../../config/database');
const Faculty = require('../../models/Faculty');
const Department = require('../../models/Department');
const Major = require('../../models/Major');
const { logger } = require('../../utils/logger');

const seedICTUData = async () => {
  try {
    logger.info('Starting ICTU initial data seeding...');

    // Create ICT Faculty
    const ictFaculty = await Faculty.create({
      name: 'Information and Communication Technology',
      code: 'ICT',
      description: 'Faculty of Information and Communication Technology offering cutting-edge technology programs'
    });

    // Create BMS Faculty
    const bmsFaculty = await Faculty.create({
      name: 'Business and Management Sciences',
      code: 'BMS',
      description: 'Faculty of Business and Management Sciences offering comprehensive business education'
    });

    // Create Majors
    const undergraduateMajor = await Major.create({
      name: 'Undergraduate Programs',
      code: 'UG',
      level: 'undergraduate',
      description: 'Bachelor degree programs'
    });

    const mastersMajor = await Major.create({
      name: 'Masters Programs',
      code: 'MS',
      level: 'masters',
      description: 'Master degree programs'
    });

    const phdMajor = await Major.create({
      name: 'PhD Programs',
      code: 'PHD',
      level: 'phd',
      description: 'Doctoral degree programs'
    });

    // Create ICT Departments
    const softwareEngineeringDept = await Department.create({
      name: 'Software Engineering',
      code: 'SE',
      facultyId: ictFaculty.id,
      description: 'Department of Software Engineering and Development'
    });

    const computerScienceDept = await Department.create({
      name: 'Computer Science',
      code: 'CS',
      facultyId: ictFaculty.id,
      description: 'Department of Computer Science and Information Systems'
    });

    const networkingDept = await Department.create({
      name: 'Networking and Cybersecurity',
      code: 'NC',
      facultyId: ictFaculty.id,
      description: 'Department of Network Administration and Cybersecurity'
    });

    const itManagementDept = await Department.create({
      name: 'IT Management',
      code: 'ITM',
      facultyId: ictFaculty.id,
      description: 'Department of Information Technology Management'
    });

    // Create BMS Departments
    const businessAdminDept = await Department.create({
      name: 'Business Administration',
      code: 'BA',
      facultyId: bmsFaculty.id,
      description: 'Department of Business Administration and Management'
    });

    const accountingDept = await Department.create({
      name: 'Accounting and Finance',
      code: 'AF',
      facultyId: bmsFaculty.id,
      description: 'Department of Accounting and Financial Management'
    });

    const marketingDept = await Department.create({
      name: 'Marketing and Sales',
      code: 'MS',
      facultyId: bmsFaculty.id,
      description: 'Department of Marketing and Sales Management'
    });

    const hrDept = await Department.create({
      name: 'Human Resource Management',
      code: 'HRM',
      facultyId: bmsFaculty.id,
      description: 'Department of Human Resource Management'
    });

    const projectManagementDept = await Department.create({
      name: 'Project Management',
      code: 'PM',
      facultyId: bmsFaculty.id,
      description: 'Department of Project Management and Operations'
    });

    logger.info('ICTU initial data seeded successfully');
    logger.info(`Created ${await Faculty.count()} faculties`);
    logger.info(`Created ${await Department.count()} departments`);
    logger.info(`Created ${await Major.count()} majors`);

    return {
      faculties: [ictFaculty, bmsFaculty],
      departments: [
        softwareEngineeringDept, computerScienceDept, networkingDept, itManagementDept,
        businessAdminDept, accountingDept, marketingDept, hrDept, projectManagementDept
      ],
      majors: [undergraduateMajor, mastersMajor, phdMajor]
    };

  } catch (error) {
    logger.error('Error seeding ICTU data:', error);
    throw error;
  }
};

// Run seeding if called directly
if (require.main === module) {
  seedICTUData()
    .then(() => {
      logger.info('Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedICTUData };
