import { Router } from 'express';
import * as analyticsService from './analytics.service.js';
import { isAuthenticated, isSuperAdmin } from '../../middleware/auth.js';
import requirePermission from '../../middleware/rbac.js';

const router = Router();

router.use(isAuthenticated, isSuperAdmin);

router.get('/superadmin/kpis', requirePermission('analytics_read'), async (req, res) => {
  try {
    const kpis = await analyticsService.getSuperAdminKPIs();
    res.json({ success: true, data: kpis });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/superadmin/platform', requirePermission('analytics_read'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Start and end dates are required' });
    }
    const stats = await analyticsService.getDetailedPlatformAnalytics(startDate, endDate);
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
