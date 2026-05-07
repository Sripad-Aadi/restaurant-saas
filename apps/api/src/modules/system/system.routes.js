import { Router } from 'express';
import * as systemService from './system.service.js';
import * as logService from './log.service.js';
import { isAuthenticated, isSuperAdmin } from '../../middleware/auth.js';
import requirePermission from '../../middleware/rbac.js';

const router = Router();

// Public settings (for platform name and maintenance status)
router.get('/public/settings', async (req, res) => {
  try {
    const settings = await systemService.getSettings();
    res.json({ 
      success: true, 
      data: {
        platformName: settings.platformName || 'Antigravity Restaurants',
        isMaintenanceMode: settings.isMaintenanceMode || false,
        maintenanceMessage: settings.maintenanceMessage || '',
        supportEmail: settings.supportEmail || '',
        supportPhone: settings.supportPhone || ''
      } 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// All other system settings routes are SuperAdmin only
router.use(isAuthenticated, isSuperAdmin);

router.get('/settings', async (req, res) => {
  try {
    const settings = await systemService.getSettings();
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch('/settings', async (req, res) => {
  try {
    const settings = await systemService.updateSettings(req.body, req.user.id);
    res.json({ success: true, data: settings });

    await logService.createLog({
      userId: req.user.id,
      action: 'SETTINGS_UPDATED',
      entityType: 'System',
      details: req.body,
      req
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/logs', async (req, res) => {
  try {
    const { page, limit, action, user } = req.query;
    const filters = {};
    if (action) filters.action = action;
    if (user) filters.user = user;

    const data = await logService.getLogs(filters, { page: parseInt(page) || 1, limit: parseInt(limit) || 50 });
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
