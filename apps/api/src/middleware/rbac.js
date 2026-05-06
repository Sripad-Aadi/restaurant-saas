import { ROLES } from '@restaurant-saas/shared';

const PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: [
    'platform_management', 'store_onboarding',
    'menu_read', 'menu_write',
    'order_read_all', 'order_status_update',
    'analytics_read', 'table_management',
  ],
  [ROLES.ADMIN]: [
    'menu_read', 'menu_write',
    'order_read_all', 'order_status_update',
    'analytics_read', 'table_management',
  ],
  [ROLES.CUSTOMER]: [
    'menu_read', 'order_create', 'order_read_own',
  ],
};

const requirePermission = (permission) => (req, res, next) => {
  const role = req.user?.role;
  if (!role) {
    return res.status(403).json({ success: false, message: 'Role not found' });
  }

  if (!PERMISSIONS[role]?.includes(permission)) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to perform this action',
    });
  }
  next();
};

export default requirePermission;