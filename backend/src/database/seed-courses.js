const { sequelize } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Seed comprehensive courses data for all departments and semesters
 */
async function seedCourses() {
  try {
    logger.info('Starting courses seeding...');
    
    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connection established');
    
    // Create courses table if it doesn't exist
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        course_code VARCHAR(20) UNIQUE NOT NULL,
        course_name VARCHAR(200) NOT NULL,
        description TEXT,
        credits INTEGER NOT NULL DEFAULT 3,
        semester INTEGER NOT NULL,
        academic_year INTEGER NOT NULL DEFAULT 1,
        department VARCHAR(100) NOT NULL,
        max_enrollment INTEGER NOT NULL DEFAULT 30,
        current_enrollment INTEGER NOT NULL DEFAULT 0,
        instructor_id UUID,
        prerequisites JSONB DEFAULT '[]',
        schedule JSONB,
        difficulty VARCHAR(20) DEFAULT 'Undergraduate',
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Insert comprehensive courses for all departments and semesters
    await sequelize.query(`
      INSERT INTO courses (course_code, course_name, description, credits, semester, academic_year, department, difficulty, status) VALUES
      
      -- Computer Science Department - Semester 1
      ('CS101', 'Introduction to Programming', 'Basic programming concepts using Python', 3, 1, 1, 'Computer Science', 'Undergraduate', 'active'),
      ('CS102', 'Computer Systems Architecture', 'Introduction to computer hardware and systems', 3, 1, 1, 'Computer Science', 'Undergraduate', 'active'),
      ('CS103', 'Discrete Mathematics', 'Mathematical foundations for computer science', 3, 1, 1, 'Computer Science', 'Undergraduate', 'active'),
      ('CS104', 'Digital Logic Design', 'Boolean algebra and digital circuits', 3, 1, 1, 'Computer Science', 'Undergraduate', 'active'),
      ('CS105', 'Introduction to Algorithms', 'Basic algorithmic thinking and problem solving', 3, 1, 1, 'Computer Science', 'Undergraduate', 'active'),
      
      -- Computer Science Department - Semester 2
      ('CS201', 'Object-Oriented Programming', 'Advanced programming with Java/C++', 3, 2, 1, 'Computer Science', 'Undergraduate', 'active'),
      ('CS202', 'Data Structures', 'Arrays, linked lists, trees, and graphs', 3, 2, 1, 'Computer Science', 'Undergraduate', 'active'),
      ('CS203', 'Database Systems', 'Relational databases and SQL', 3, 2, 1, 'Computer Science', 'Undergraduate', 'active'),
      ('CS204', 'Computer Networks', 'Network protocols and communication', 3, 2, 1, 'Computer Science', 'Undergraduate', 'active'),
      ('CS205', 'Web Development', 'HTML, CSS, JavaScript, and frameworks', 3, 2, 1, 'Computer Science', 'Undergraduate', 'active'),
      
      -- Information Technology Department - Semester 1
      ('IT101', 'IT Fundamentals', 'Introduction to information technology', 3, 1, 1, 'Information Technology', 'Undergraduate', 'active'),
      ('IT102', 'Network Administration', 'Managing computer networks', 3, 1, 1, 'Information Technology', 'Undergraduate', 'active'),
      ('IT103', 'System Administration', 'Server and system management', 3, 1, 1, 'Information Technology', 'Undergraduate', 'active'),
      ('IT104', 'Cybersecurity Basics', 'Introduction to information security', 3, 1, 1, 'Information Technology', 'Undergraduate', 'active'),
      ('IT105', 'Help Desk Operations', 'Technical support and troubleshooting', 3, 1, 1, 'Information Technology', 'Undergraduate', 'active'),
      
      -- Information Technology Department - Semester 2
      ('IT201', 'Advanced Networking', 'Complex network configurations', 3, 2, 1, 'Information Technology', 'Undergraduate', 'active'),
      ('IT202', 'Cloud Computing', 'Cloud services and virtualization', 3, 2, 1, 'Information Technology', 'Undergraduate', 'active'),
      ('IT203', 'IT Project Management', 'Managing technology projects', 3, 2, 1, 'Information Technology', 'Undergraduate', 'active'),
      ('IT204', 'Mobile Device Management', 'Managing mobile technologies', 3, 2, 1, 'Information Technology', 'Undergraduate', 'active'),
      ('IT205', 'IT Service Management', 'ITIL and service delivery', 3, 2, 1, 'Information Technology', 'Undergraduate', 'active'),
      
      -- Software Engineering Department - Semester 1
      ('SE101', 'Software Engineering Principles', 'Introduction to software development lifecycle', 3, 1, 1, 'Software Engineering', 'Undergraduate', 'active'),
      ('SE102', 'Requirements Engineering', 'Gathering and analyzing software requirements', 3, 1, 1, 'Software Engineering', 'Undergraduate', 'active'),
      ('SE103', 'Software Design Patterns', 'Common design patterns in software', 3, 1, 1, 'Software Engineering', 'Undergraduate', 'active'),
      ('SE104', 'Version Control Systems', 'Git, SVN, and collaborative development', 3, 1, 1, 'Software Engineering', 'Undergraduate', 'active'),
      ('SE105', 'Agile Development', 'Scrum, Kanban, and agile methodologies', 3, 1, 1, 'Software Engineering', 'Undergraduate', 'active'),
      
      -- Software Engineering Department - Semester 2
      ('SE201', 'Software Testing', 'Unit testing, integration testing, QA', 3, 2, 1, 'Software Engineering', 'Undergraduate', 'active'),
      ('SE202', 'Software Architecture', 'System design and architectural patterns', 3, 2, 1, 'Software Engineering', 'Undergraduate', 'active'),
      ('SE203', 'DevOps Practices', 'CI/CD, deployment, and operations', 3, 2, 1, 'Software Engineering', 'Undergraduate', 'active'),
      ('SE204', 'Mobile App Development', 'iOS and Android development', 3, 2, 1, 'Software Engineering', 'Undergraduate', 'active'),
      ('SE205', 'Software Project Management', 'Managing software development projects', 3, 2, 1, 'Software Engineering', 'Undergraduate', 'active'),
      
      -- Business Administration Department - Semester 1
      ('BA101', 'Principles of Management', 'Introduction to business management', 3, 1, 1, 'Business Administration', 'Undergraduate', 'active'),
      ('BA102', 'Business Communication', 'Professional communication skills', 3, 1, 1, 'Business Administration', 'Undergraduate', 'active'),
      ('BA103', 'Accounting Fundamentals', 'Basic accounting principles', 3, 1, 1, 'Business Administration', 'Undergraduate', 'active'),
      ('BA104', 'Business Ethics', 'Ethical decision making in business', 3, 1, 1, 'Business Administration', 'Undergraduate', 'active'),
      ('BA105', 'Introduction to Economics', 'Microeconomics and macroeconomics basics', 3, 1, 1, 'Business Administration', 'Undergraduate', 'active'),
      
      -- Business Administration Department - Semester 2
      ('BA201', 'Strategic Management', 'Business strategy and planning', 3, 2, 1, 'Business Administration', 'Undergraduate', 'active'),
      ('BA202', 'Operations Management', 'Managing business operations', 3, 2, 1, 'Business Administration', 'Undergraduate', 'active'),
      ('BA203', 'Human Resource Management', 'Managing people in organizations', 3, 2, 1, 'Business Administration', 'Undergraduate', 'active'),
      ('BA204', 'Business Law', 'Legal aspects of business', 3, 2, 1, 'Business Administration', 'Undergraduate', 'active'),
      ('BA205', 'International Business', 'Global business practices', 3, 2, 1, 'Business Administration', 'Undergraduate', 'active'),
      
      -- Marketing Department - Semester 1
      ('MKT101', 'Principles of Marketing', 'Introduction to marketing concepts', 3, 1, 1, 'Marketing', 'Undergraduate', 'active'),
      ('MKT102', 'Consumer Behavior', 'Understanding customer psychology', 3, 1, 1, 'Marketing', 'Undergraduate', 'active'),
      ('MKT103', 'Market Research', 'Research methods and data analysis', 3, 1, 1, 'Marketing', 'Undergraduate', 'active'),
      ('MKT104', 'Brand Management', 'Building and managing brands', 3, 1, 1, 'Marketing', 'Undergraduate', 'active'),
      ('MKT105', 'Sales Management', 'Sales techniques and management', 3, 1, 1, 'Marketing', 'Undergraduate', 'active'),
      
      -- Marketing Department - Semester 2
      ('MKT201', 'Digital Marketing', 'Online marketing strategies', 3, 2, 1, 'Marketing', 'Undergraduate', 'active'),
      ('MKT202', 'Social Media Marketing', 'Marketing through social platforms', 3, 2, 1, 'Marketing', 'Undergraduate', 'active'),
      ('MKT203', 'Advertising and Promotion', 'Creating effective advertisements', 3, 2, 1, 'Marketing', 'Undergraduate', 'active'),
      ('MKT204', 'Marketing Analytics', 'Data-driven marketing decisions', 3, 2, 1, 'Marketing', 'Undergraduate', 'active'),
      ('MKT205', 'International Marketing', 'Global marketing strategies', 3, 2, 1, 'Marketing', 'Undergraduate', 'active'),
      
      -- Finance Department - Semester 1
      ('FIN101', 'Principles of Finance', 'Introduction to financial management', 3, 1, 1, 'Finance', 'Undergraduate', 'active'),
      ('FIN102', 'Financial Accounting', 'Financial statement preparation', 3, 1, 1, 'Finance', 'Undergraduate', 'active'),
      ('FIN103', 'Investment Analysis', 'Evaluating investment opportunities', 3, 1, 1, 'Finance', 'Undergraduate', 'active'),
      ('FIN104', 'Corporate Finance', 'Financial decision making in corporations', 3, 1, 1, 'Finance', 'Undergraduate', 'active'),
      ('FIN105', 'Financial Markets', 'Understanding financial markets', 3, 1, 1, 'Finance', 'Undergraduate', 'active'),
      
      -- Finance Department - Semester 2
      ('FIN201', 'Portfolio Management', 'Managing investment portfolios', 3, 2, 1, 'Finance', 'Undergraduate', 'active'),
      ('FIN202', 'Risk Management', 'Identifying and managing financial risks', 3, 2, 1, 'Finance', 'Undergraduate', 'active'),
      ('FIN203', 'International Finance', 'Global financial management', 3, 2, 1, 'Finance', 'Undergraduate', 'active'),
      ('FIN204', 'Financial Planning', 'Personal and corporate financial planning', 3, 2, 1, 'Finance', 'Undergraduate', 'active'),
      ('FIN205', 'Banking and Credit', 'Banking operations and credit analysis', 3, 2, 1, 'Finance', 'Undergraduate', 'active')
      
      ON CONFLICT (course_code) DO NOTHING;
    `);
    
    logger.info('Sample courses seeded successfully');
    
    // Verify the data
    const [courses] = await sequelize.query('SELECT COUNT(*) as count FROM courses');
    const [semester1] = await sequelize.query('SELECT COUNT(*) as count FROM courses WHERE semester = 1');
    const [semester2] = await sequelize.query('SELECT COUNT(*) as count FROM courses WHERE semester = 2');
    
    logger.info(`Seeded courses - Total: ${courses[0].count}, Semester 1: ${semester1[0].count}, Semester 2: ${semester2[0].count}`);
    
    process.exit(0);
    
  } catch (error) {
    logger.error('Courses seeding failed:', error);
    process.exit(1);
  }
}

// Run the seeding
seedCourses();
