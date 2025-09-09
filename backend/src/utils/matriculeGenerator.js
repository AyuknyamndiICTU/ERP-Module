const { sequelize } = require('../config/database');

/**
 * Generate ICTU matricule in format: ICTU + year + 4-digit sequential number
 * Example: ICTU20234121
 */
const generateMatricule = async (registrationYear = null) => {
  try {
    const year = registrationYear || new Date().getFullYear();
    
    // Get the count of students registered in this year
    const countQuery = `
      SELECT COUNT(*) as count 
      FROM students 
      WHERE registration_year = :year
    `;
    
    const result = await sequelize.query(countQuery, {
      replacements: { year },
      type: sequelize.QueryTypes.SELECT
    });
    
    const count = parseInt(result[0].count) || 0;
    const nextNumber = count + 1;
    
    // Format as 4-digit number with leading zeros
    const sequentialNumber = nextNumber.toString().padStart(4, '0');
    
    // Generate matricule: ICTU + year + sequential number
    const matricule = `ICTU${year}${sequentialNumber}`;
    
    return matricule;
  } catch (error) {
    console.error('Error generating matricule:', error);
    throw new Error('Failed to generate matricule');
  }
};

/**
 * Validate matricule format
 */
const validateMatricule = (matricule) => {
  const matriculeRegex = /^ICTU\d{4}\d{4}$/;
  return matriculeRegex.test(matricule);
};

/**
 * Extract year from matricule
 */
const extractYearFromMatricule = (matricule) => {
  if (!validateMatricule(matricule)) {
    throw new Error('Invalid matricule format');
  }
  return parseInt(matricule.substring(4, 8));
};

/**
 * Extract sequential number from matricule
 */
const extractSequentialNumber = (matricule) => {
  if (!validateMatricule(matricule)) {
    throw new Error('Invalid matricule format');
  }
  return parseInt(matricule.substring(8, 12));
};

module.exports = {
  generateMatricule,
  validateMatricule,
  extractYearFromMatricule,
  extractSequentialNumber
};
