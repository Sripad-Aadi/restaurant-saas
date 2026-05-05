import express from 'express';
import * as userService from './user.service.js';
import { isAuthenticated, isSuperAdmin } from '../../middleware/auth.js';
import requirePermission from '../../middleware/rbac.js';

const router = express.Router();

// All user management routes are SuperAdmin only
router.use(isAuthenticated, isSuperAdmin);

router.get('/', requirePermission('platform_management'), async (req, res) => {
  try {
    const { role, search } = req.query;
    const users = await userService.getAllUsers({ role, search });
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/:id/logout', requirePermission('platform_management'), async (req, res) => {
  try {
    await userService.forceLogout(req.params.id);
    res.json({ success: true, message: 'User forced to logout' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch('/:id/status', requirePermission('platform_management'), async (req, res) => {
  try {
    const user = await userService.toggleUserStatus(req.params.id);
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
