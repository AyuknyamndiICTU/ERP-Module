const fs = require('fs');
const path = require('path');

// Files to clean up based on build warnings
const filesToFix = [
  'src/components/Common/ErrorBoundary.js',
  'src/components/GlassCard.js',
  'src/components/Layout/Layout.js',
  'src/pages/Academic/AttendancePage.js',
  'src/pages/Academic/CoursesPage.js',
  'src/pages/Academic/GradesPage.js',
  'src/pages/Academic/StudentsPage.js',
  'src/pages/Dashboard/DashboardPage.js',
  'src/pages/Finance/CampaignsPage.js',
  'src/pages/Finance/InvoicesPage.js',
  'src/pages/Finance/PaymentsPage.js',
  'src/pages/HR/AssetsPage.js',
  'src/pages/HR/EmployeesPage.js',
  'src/pages/HR/LeavePage.js',
  'src/pages/HR/PayrollPage.js',
  'src/services/api.js'
];

// Function to remove unused imports
function removeUnusedImports(content, filename) {
  const lines = content.split('\n');
  const newLines = [];
  let inImportBlock = false;
  let currentImportBlock = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.trim().startsWith('import ') && line.includes('from ')) {
      inImportBlock = true;
      currentImportBlock = [line];
    } else if (inImportBlock && line.trim().startsWith('}')) {
      currentImportBlock.push(line);
      // Process the import block
      const processedBlock = processImportBlock(currentImportBlock, content);
      newLines.push(...processedBlock);
      currentImportBlock = [];
      inImportBlock = false;
    } else if (inImportBlock) {
      currentImportBlock.push(line);
    } else {
      newLines.push(line);
    }
  }
  
  return newLines.join('\n');
}

// Function to process import blocks and remove unused imports
function processImportBlock(importBlock, fullContent) {
  // This is a simplified version - in practice you'd need AST parsing
  // For now, just return the original block
  return importBlock;
}

// Function to replace console statements with logger
function replaceConsoleStatements(content) {
  // Replace console.log with logger.debug
  content = content.replace(/console\.log\(/g, 'logger.debug(');
  
  // Replace console.error with logger.error (but keep some for critical errors)
  content = content.replace(/console\.error\(/g, 'logger.error(');
  
  // Replace console.warn with logger.warn
  content = content.replace(/console\.warn\(/g, 'logger.warn(');
  
  // Replace console.info with logger.info
  content = content.replace(/console\.info\(/g, 'logger.info(');
  
  return content;
}

// Function to add logger import if console statements were replaced
function addLoggerImport(content) {
  if (content.includes('logger.')) {
    // Check if logger is already imported
    if (!content.includes("import logger from")) {
      // Find the last import statement
      const lines = content.split('\n');
      let lastImportIndex = -1;
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith('import ')) {
          lastImportIndex = i;
        }
      }
      
      if (lastImportIndex !== -1) {
        lines.splice(lastImportIndex + 1, 0, "import logger from '../../utils/logger';");
        content = lines.join('\n');
      }
    }
  }
  
  return content;
}

// Function to fix specific file issues
function fixSpecificIssues(content, filename) {
  // Fix ErrorBoundary console statement
  if (filename.includes('ErrorBoundary.js')) {
    content = content.replace(
      'console.error(\'Error Boundary caught an error\', error, {',
      'logger.error(\'Error Boundary caught an error\', error, {'
    );
  }
  
  // Fix unused variables by commenting them out or removing them
  if (filename.includes('GlassCard.js')) {
    content = content.replace(
      "const hoverGlow = keyframes`",
      "// const hoverGlow = keyframes`"
    );
  }
  
  return content;
}

// Main processing function
function processFile(filePath) {
  try {
    const fullPath = path.resolve(filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`File not found: ${filePath}`);
      return;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;
    
    // Apply fixes
    content = replaceConsoleStatements(content);
    content = addLoggerImport(content);
    content = fixSpecificIssues(content, filePath);
    
    // Only write if content changed
    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
    } else {
      console.log(`⏭️  No changes needed: ${filePath}`);
    }
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

// Run the cleanup
console.log('🧹 Starting comprehensive cleanup...\n');

filesToFix.forEach(file => {
  console.log(`Processing: ${file}`);
  processFile(file);
});

console.log('\n✨ Cleanup completed!');
console.log('\n📝 Next steps:');
console.log('1. Run: npm run build');
console.log('2. Check for remaining warnings');
console.log('3. Test the application');
