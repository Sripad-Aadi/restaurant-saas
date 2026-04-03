const PERMISSIONS = {
  SUPER_ADMIN: [
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
  if (!role || !PERMISSIONS[role]?.includes(permission)) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to perform this action',
    });
  }
  next();
};

export default requirePermission;