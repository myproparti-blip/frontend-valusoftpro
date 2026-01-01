// RBAC Configuration - Role-Based Access Control
// Updated for multi-client support with unified manager role

// Role color scheme for UI consistency
export const getRoleColors = (role) => {
    const colorMap = {
        'admin': 'from-red-600 to-red-700',
        'manager': 'from-purple-600 to-purple-700',
        'user': 'from-blue-600 to-blue-700',
    };
    return colorMap[role] || 'from-gray-600 to-gray-700';
};

// Role descriptions for user-facing text
export const getRoleDescription = (role) => {
    const descriptionMap = {
        'admin': 'System Administrator',
        'manager': 'Manager',
        'user': 'Regular User',
    };
    return descriptionMap[role] || 'Unknown Role';
};

// Get dashboard cards accessible by role
export const getRoleDashboardCards = (role) => {
    const cardMap = {
        'admin': ['all'],
        'manager': ['pending', 'on-progress', 'approved', 'rejected'],
        'user': ['pending', 'on-progress', 'approved', 'rejected'],
    };
    return cardMap[role] || [];
};

// Check if user is a manager or admin
export const isManagerOrAdmin = (role) => {
    return ['manager', 'admin'].includes(role);
};

// Check if user is a regular user
export const isRegularUser = (role) => {
    return role === 'user';
};

// Check if user is admin
export const isAdmin = (role) => {
    return role === 'admin';
};

// Check specific role
export const hasRole = (userRole, requiredRole) => {
    return userRole === requiredRole;
};

// Check if user has any of the specified roles
export const hasAnyRole = (userRole, requiredRoles) => {
    return requiredRoles.includes(userRole);
};

// Get role hierarchy level (higher = more permissions)
export const getRoleLevel = (role) => {
    const levelMap = {
        'admin': 4,
        'manager': 3,
        'user': 1,
    };
    return levelMap[role] || 0;
};

// Check if user has higher or equal role level
export const hasRoleLevel = (userRole, minimumLevel) => {
    return getRoleLevel(userRole) >= minimumLevel;
};
