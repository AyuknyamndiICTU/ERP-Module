const { sequelize } = require('../config/database');

/**
 * Helper functions for retrieving student data including emergency contacts
 */

/**
 * Get student with emergency contact information
 * @param {string} matricule - Student matricule
 * @returns {Object} Student data with parsed emergency contact
 */
async function getStudentWithEmergencyContact(matricule) {
  try {
    const [results] = await sequelize.query(`
      SELECT 
        id,
        matricule,
        student_id,
        first_name,
        last_name,
        email,
        phone,
        date_of_birth,
        region_of_origin,
        place_of_origin,
        gender,
        age,
        blood_group,
        address,
        faculty_id,
        department_id,
        major_id,
        semester,
        level,
        status,
        created_at,
        updated_at
      FROM students 
      WHERE matricule = ?
    `, { replacements: [matricule] });

    if (results.length === 0) {
      return null;
    }

    const student = results[0];
    
    // Parse address field to extract emergency contact
    let addressData = {};
    let emergencyContact = null;
    
    if (student.address) {
      try {
        addressData = typeof student.address === 'string' 
          ? JSON.parse(student.address) 
          : student.address;
        
        emergencyContact = addressData.emergencyContact || null;
        
        // Remove emergency contact from address for cleaner separation
        const { emergencyContact: _, ...cleanAddress } = addressData;
        addressData = cleanAddress;
      } catch (e) {
        console.warn('Error parsing address data:', e.message);
      }
    }

    return {
      ...student,
      address: addressData,
      emergencyContact
    };
  } catch (error) {
    console.error('Error retrieving student with emergency contact:', error);
    throw error;
  }
}

/**
 * Get all students with emergency contact information
 * @param {Object} filters - Optional filters (status, faculty_id, etc.)
 * @returns {Array} Array of students with parsed emergency contacts
 */
async function getAllStudentsWithEmergencyContacts(filters = {}) {
  try {
    let whereClause = '';
    const replacements = [];
    
    if (Object.keys(filters).length > 0) {
      const conditions = [];
      
      if (filters.status) {
        conditions.push('status = ?');
        replacements.push(filters.status);
      }
      
      if (filters.faculty_id) {
        conditions.push('faculty_id = ?');
        replacements.push(filters.faculty_id);
      }
      
      if (filters.department_id) {
        conditions.push('department_id = ?');
        replacements.push(filters.department_id);
      }
      
      if (conditions.length > 0) {
        whereClause = 'WHERE ' + conditions.join(' AND ');
      }
    }

    const [results] = await sequelize.query(`
      SELECT 
        id,
        matricule,
        first_name,
        last_name,
        email,
        phone,
        address,
        status
      FROM students 
      ${whereClause}
      ORDER BY created_at DESC
    `, { replacements });

    return results.map(student => {
      let emergencyContact = null;
      let addressData = {};
      
      if (student.address) {
        try {
          const parsed = typeof student.address === 'string' 
            ? JSON.parse(student.address) 
            : student.address;
          
          emergencyContact = parsed.emergencyContact || null;
          const { emergencyContact: _, ...cleanAddress } = parsed;
          addressData = cleanAddress;
        } catch (e) {
          console.warn('Error parsing address for student', student.matricule, ':', e.message);
        }
      }

      return {
        ...student,
        address: addressData,
        emergencyContact
      };
    });
  } catch (error) {
    console.error('Error retrieving students with emergency contacts:', error);
    throw error;
  }
}

/**
 * Update emergency contact for a student
 * @param {string} matricule - Student matricule
 * @param {Object} emergencyContact - New emergency contact data
 * @returns {boolean} Success status
 */
async function updateEmergencyContact(matricule, emergencyContact) {
  try {
    // Get current address data
    const [results] = await sequelize.query(
      'SELECT address FROM students WHERE matricule = ?',
      { replacements: [matricule] }
    );

    if (results.length === 0) {
      throw new Error('Student not found');
    }

    let currentAddress = {};
    if (results[0].address) {
      try {
        currentAddress = typeof results[0].address === 'string' 
          ? JSON.parse(results[0].address) 
          : results[0].address;
      } catch (e) {
        console.warn('Error parsing current address:', e.message);
      }
    }

    // Update with new emergency contact
    const updatedAddress = {
      ...currentAddress,
      emergencyContact
    };

    // Save back to database
    await sequelize.query(
      'UPDATE students SET address = ?, updated_at = NOW() WHERE matricule = ?',
      { replacements: [JSON.stringify(updatedAddress), matricule] }
    );

    return true;
  } catch (error) {
    console.error('Error updating emergency contact:', error);
    throw error;
  }
}

module.exports = {
  getStudentWithEmergencyContact,
  getAllStudentsWithEmergencyContacts,
  updateEmergencyContact
};
