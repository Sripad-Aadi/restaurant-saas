const PERMISSIONS = {
  SUPERADMIN: [
    'platform_management', 'store_onboarding',
    'menu_read', 'menu_write',
    'order_read_all', 'order_status_update',
    'analytics_read', 'table_management',
  ],
  SUPER_ADMIN: [ // Fallback
    'platform_management', 'store_onboarding',
    'menu_read', 'menu_write',
    'order_read_all', 'order_status_update',
    'analytics_read', 'table_management',
  ],
  ADMIN: [
    'menu_read', 'menu_write',
    'order_read_all', 'order_status_update',
    'analytics_read', 'table_management',
  ],
  CUSTOMER: [
    'menu_read', 'order_create', 'order_read_own',
  ],
};

const requirePermission = (permission) => (req, res, next) => {
  const role = req.user?.role;
  if (!role) {
    return res.status(403).json({ success: false, message: 'Role not found' });
  }
  const normalizedRole = role.toUpperCase().replace('_', ''); // Normalize both SUPER_ADMIN and SUPERADMIN to SUPERADMIN
  if (!PERMISSIONS[normalizedRole]?.includes(permission)) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to perform this action',
    });
  }
  next();
};

export default requirePermission;