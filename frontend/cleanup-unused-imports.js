const fs = require('fs');
const path = require('path');

// Files with known unused imports based on build warnings
const filesToClean = [
  'src/pages/Academic/GradesPage.js',
  'src/pages/Academic/StudentsPage.js', 
  'src/pages/Dashboard/DashboardPage.js',
  'src/pages/Finance/CampaignsPage.js',
  'src/pages/Finance/PaymentsPage.js',
  'src/pages/HR/AssetsPage.js',
  'src/pages/HR/EmployeesPage.js',
  'src/pages/HR/LeavePage.js',
  'src/pages/HR/PayrollPage.js',
  'src/pages/Auth/LoginPage.js'
];

// Known unused imports to remove
const unusedImports = {
  'src/pages/Academic/GradesPage.js': [
    'Paper',
    'SchoolIcon',
    'DownloadIcon',
    'GradientCard',
    'FeatureCard'
  ],
  'src/pages/Academic/StudentsPage.js': [
    'IconButton',
    'Table',
    'TableBody', 
    'TableCell',
    'TableContainer',
    'TableHead',
    'TableRow',
    'ViewIcon',
    'GradientCard'
  ],
  'src/pages/Dashboard/DashboardPage.js': [
    'List',
    'ListItem',
    'ListItemText',
    'ListItemAvatar',
    'Divider',
    'Button',
    'IconButton',
    'WorkIcon',
    'NotificationsIcon',
    'MoreVertIcon',
    'AutoGraphIcon',
    'CalendarIcon',
    'StarIcon',
    'RocketIcon',
    'GradientCard',
    'FeatureCard',
    'ConfirmDialog'
  ],
  'src/pages/Finance/CampaignsPage.js': [
    'Card',
    'Tooltip',
    'StopIcon'
  ],
  'src/pages/Finance/PaymentsPage.js': [
    'Card',
    'DownloadIcon',
    'ConfirmDialog'
  ],
  'src/pages/HR/AssetsPage.js': [
    'Card'
  ],
  'src/pages/HR/EmployeesPage.js': [
    'Card',
    'Tooltip',
    'PersonIcon'
  ],
  'src/pages/HR/LeavePage.js': [
    'Card',
    'CalendarIcon',
    'PersonIcon'
  ],
  'src/pages/HR/PayrollPage.js': [
    'Card',
    'LinearProgress',
    'SalaryIcon',
    'BankIcon',
    'ConfirmDialog'
  ],
  'src/pages/Auth/LoginPage.js': [
    'fadeInUp'
  ]
};

function removeUnusedImports(filePath) {
  try {
    const fullPath = path.resolve(filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`❌ File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;
    
    const unusedForFile = unusedImports[filePath] || [];
    let modified = false;

    // Remove unused imports
    unusedForFile.forEach(unusedImport => {
      // Remove from import statements
      const patterns = [
        new RegExp(`\\s*${unusedImport}\\s*,`, 'g'),
        new RegExp(`,\\s*${unusedImport}\\s*`, 'g'),
        new RegExp(`\\s*${unusedImport}\\s*as\\s+\\w+\\s*,`, 'g'),
        new RegExp(`,\\s*${unusedImport}\\s*as\\s+\\w+\\s*`, 'g'),
        new RegExp(`import\\s+${unusedImport}\\s+from[^;]+;\\s*`, 'g'),
        new RegExp(`\\s*${unusedImport}\\s*as\\s+\\w+Icon\\s*,`, 'g'),
        new RegExp(`,\\s*${unusedImport}\\s*as\\s+\\w+Icon\\s*`, 'g')
      ];

      patterns.forEach(pattern => {
        const newContent = content.replace(pattern, '');
        if (newContent !== content) {
          content = newContent;
          modified = true;
        }
      });

      // Remove unused variable declarations
      const varPatterns = [
        new RegExp(`\\s*const\\s+${unusedImport}\\s*=.*?;\\s*`, 'g'),
        new RegExp(`\\s*let\\s+${unusedImport}\\s*=.*?;\\s*`, 'g'),
        new RegExp(`\\s*var\\s+${unusedImport}\\s*=.*?;\\s*`, 'g')
      ];

      varPatterns.forEach(pattern => {
        const newContent = content.replace(pattern, '');
        if (newContent !== content) {
          content = newContent;
          modified = true;
        }
      });
    });

    // Clean up empty import lines
    content = content.replace(/import\s*{\s*}\s*from[^;]+;\s*/g, '');
    content = content.replace(/import\s*{\s*,\s*}\s*from[^;]+;\s*/g, '');
    content = content.replace(/{\s*,/g, '{');
    content = content.replace(/,\s*}/g, '}');
    content = content.replace(/,\s*,/g, ',');

    // Clean up extra whitespace
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Cleaned: ${filePath}`);
      modified = true;
    } else {
      console.log(`⏭️  No changes needed: ${filePath}`);
    }

    return modified;

  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Run the cleanup
console.log('🧹 Starting unused import cleanup...\n');

let totalModified = 0;
filesToClean.forEach(file => {
  console.log(`Processing: ${file}`);
  if (removeUnusedImports(file)) {
    totalModified++;
  }
});

console.log(`\n✨ Cleanup completed!`);
console.log(`📊 Modified ${totalModified} files`);
console.log('\n📝 Next steps:');
console.log('1. Run: npm run build');
console.log('2. Check for remaining warnings');
console.log('3. Test the application');
