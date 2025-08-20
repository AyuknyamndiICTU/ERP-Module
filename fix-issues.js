const fs = require('fs');
const path = require('path');

// List of files to fix
const filesToFix = [
  'frontend/src/pages/Finance/PaymentsPage.js',
  'frontend/src/pages/Finance/CampaignsPage.js',
  'frontend/src/pages/HR/AssetsPage.js',
  'frontend/src/pages/HR/EmployeesPage.js',
  'frontend/src/pages/HR/LeavePage.js',
  'frontend/src/pages/HR/PayrollPage.js',
  'frontend/src/pages/Academic/AttendancePage.js',
  'frontend/src/pages/Academic/CoursesPage.js',
  'frontend/src/pages/Academic/GradesPage.js',
  'frontend/src/pages/Academic/StudentsPage.js',
  'frontend/src/pages/Dashboard/DashboardPage.js',
  'frontend/src/pages/Auth/LoginPage.js',
  'frontend/src/components/Common/DialogComponents.js',
  'frontend/src/components/Layout/Layout.js',
  'frontend/src/hooks/useApiData.js',
  'frontend/src/services/api.js'
];

// Function to fix console.log statements
function fixConsoleStatements(content) {
  // Replace console.log with comments
  content = content.replace(/console\.log\([^)]*\);?/g, '/* Debug log removed */');
  
  // Keep console.error for error handling
  return content;
}

// Function to remove unused imports
function removeUnusedImports(content, filename) {
  const lines = content.split('\n');
  const usedImports = new Set();
  const importLines = [];
  let inImportBlock = false;
  
  // Find all imports and their usage
  lines.forEach((line, index) => {
    if (line.includes('import ') && line.includes('from ')) {
      importLines.push({ line, index });
      inImportBlock = true;
    } else if (inImportBlock && line.trim() === '') {
      inImportBlock = false;
    }
  });
  
  // This is a simplified version - in practice, you'd need more sophisticated parsing
  return content;
}

// Function to fix specific file issues
function fixFileSpecificIssues(content, filename) {
  if (filename.includes('DialogComponents.js')) {
    // Fix the export default issue
    content = content.replace(
      'export default { useApiData, useDialogState, useFormState };',
      'const DialogComponents = { FormDialog, ConfirmDialog, DetailDialog };\nexport default DialogComponents;'
    );
  }
  
  if (filename.includes('useApiData.js')) {
    // Fix the export default issue
    content = content.replace(
      'export default { useApiData, useDialogState, useFormState };',
      'const ApiHooks = { useApiData, useDialogState, useFormState };\nexport default ApiHooks;'
    );
  }
  
  return content;
}

// Main function to process files
function processFile(filePath) {
  try {
    const fullPath = path.resolve(filePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`File not found: ${filePath}`);
      return;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Apply fixes
    content = fixConsoleStatements(content);
    content = removeUnusedImports(content, filePath);
    content = fixFileSpecificIssues(content, filePath);
    
    // Write back to file
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Fixed: ${filePath}`);
    
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

// Process all files
console.log('Starting to fix issues...');
filesToFix.forEach(processFile);
console.log('Done fixing issues!');
