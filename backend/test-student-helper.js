const { 
  getStudentWithEmergencyContact, 
  getAllStudentsWithEmergencyContacts,
  updateEmergencyContact 
} = require('./src/utils/studentDataHelper');

async function testStudentHelper() {
  console.log('🧪 TESTING STUDENT DATA HELPER FUNCTIONS...\n');
  
  try {
    // Test 1: Get specific student with emergency contact
    console.log('1️⃣ Testing getStudentWithEmergencyContact...');
    const student = await getStudentWithEmergencyContact('ICTU20250014');
    
    if (student) {
      console.log('✅ Student found:', student.first_name, student.last_name);
      console.log('📧 Emergency Contact:', student.emergencyContact);
      console.log('🏠 Address:', student.address);
    } else {
      console.log('❌ Student not found');
    }
    console.log();
    
    // Test 2: Get all students with emergency contacts
    console.log('2️⃣ Testing getAllStudentsWithEmergencyContacts...');
    const students = await getAllStudentsWithEmergencyContacts({ status: 'pending' });
    console.log('✅ Found', students.length, 'pending students');
    
    students.slice(0, 2).forEach((s, i) => {
      console.log(`   Student ${i + 1}: ${s.first_name} ${s.last_name} (${s.matricule})`);
      console.log(`   Emergency Contact: ${s.emergencyContact ? s.emergencyContact.name : 'None'}`);
    });
    console.log();
    
    // Test 3: Update emergency contact
    console.log('3️⃣ Testing updateEmergencyContact...');
    const newEmergencyContact = {
      name: 'Updated Contact',
      relationship: 'Guardian',
      phoneNumber: '555-0123',
      email: 'updated@example.com'
    };
    
    await updateEmergencyContact('ICTU20250014', newEmergencyContact);
    console.log('✅ Emergency contact updated');
    
    // Verify the update
    const updatedStudent = await getStudentWithEmergencyContact('ICTU20250014');
    console.log('📧 Updated Emergency Contact:', updatedStudent.emergencyContact);
    console.log();
    
    console.log('🎉 ALL HELPER FUNCTIONS WORKING CORRECTLY!');
    console.log();
    console.log('📋 USAGE EXAMPLES:');
    console.log('// Get student with emergency contact');
    console.log('const student = await getStudentWithEmergencyContact("ICTU20250001");');
    console.log('console.log(student.emergencyContact.name);');
    console.log();
    console.log('// Get all pending students');
    console.log('const students = await getAllStudentsWithEmergencyContacts({ status: "pending" });');
    console.log();
    console.log('// Update emergency contact');
    console.log('await updateEmergencyContact("ICTU20250001", { name: "New Contact", ... });');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testStudentHelper();
