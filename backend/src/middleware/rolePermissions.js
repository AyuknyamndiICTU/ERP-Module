const { logger } = require('../utils/logger');

// Define permissions for each role
const rolePermissions = {
  admin: {
    courses: ['create', 'read', 'update', 'delete'],
    grades: ['create', 'read', 'update', 'delete'],
    attendance: ['create', 'read', 'update', 'delete'],
    students: ['create', 'read', 'update', 'delete'],
    finance: ['create', 'read', 'update', 'delete'],
    hr: ['create', 'read', 'update', 'delete'],
    reports: ['create', 'read', 'update', 'delete']
  },
  teacher: {
    courses: ['create', 'read', 'update'],
    grades: ['create', 'read', 'update'],
    attendance: ['create', 'read', 'update'],
    students: ['read'],
    reports: ['read']
  },
  finance_staff: {
    finance: ['create', 'read', 'update', 'delete'],
    students: ['read'],
    reports: ['read']
  },
  hr_staff: {
    hr: ['create', 'read', 'update', 'delete'],
    reports: ['read']
  },
  student: {
    grades: ['read_own'],
    attendance: ['read_own'],
    courses: ['read'],
    profile: ['read', 'update']
  }
};

// Check if user has permission for a specific action
const hasPermission = (userRole, module, action, resourceOwnerId = null, userId = null) => {
  const permissions = rolePermissions[userRole];
  
  if (!permissions || !permissions[module]) {
    return false;
  }

  // Check for specific 'own' permissions (e.g., read_own)
  if (action.endsWith('_own')) {
    const baseAction = action.replace('_own', '');
    return permissions[module].includes(action) || 
           (permissions[module].includes(baseAction) && resourceOwnerId === userId);
  }

  return permissions[module].includes(action);
};

// Middleware to check permissions
const checkPermission = (module, action) => {
  return (req, res, next) => {
    try {
      const userRole = req.user.role;
      const userId = req.user.id;
      const resourceOwnerId = req.params.userId || req.body.userId || req.query.userId;

      if (!hasPermission(userRole, module, action, resourceOwnerId, userId)) {
        logger.warn(`Permission denied: User ${userId} (${userRole}) attempted ${action} on ${module}`);
        
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to perform this action',
          requiredPermission: `${module}:${action}`,
          userRole: userRole
        });
      }

      next();
    } catch (error) {
      logger.error('Permission check error:', error);
      res.status(500).json({
        success: false,
        message: 'Error checking permissions'
      });
    }
  };
};

// Check if user can access specific student data
const canAccessStudentData = (userRole, userId, studentUserId) => {
  if (userRole === 'admin' || userRole === 'teacher') {
    return true;
  }
  
  if (userRole === 'student' && userId === studentUserId) {
    return true;
  }
  
  return false;
};

module.exports = {
  rolePermissions,
  hasPermission,
  checkPermission,
  canAccessStudentData
};
