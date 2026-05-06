import { Router } from 'express';
import * as analyticsService from './analytics.service.js';
import { isAuthenticated, isSuperAdmin } from '../../middleware/auth.js';
import requirePermission from '../../middleware/rbac.js';

const router = Router();

// Platform Analytics (Super Admin Only)
router.get('/superadmin/kpis', isAuthenticated, isSuperAdmin, requirePermission('analytics_read'), async (req, res) => {
  try {
    const kpis = await analyticsService.getSuperAdminKPIs();
    res.json({ success: true, data: kpis });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/superadmin/platform', isAuthenticated, isSuperAdmin, requirePermission('analytics_read'), async (req, res) => {
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

// Store Analytics (Store Admin)
router.get('/store/kpis', isAuthenticated, requirePermission('analytics_read'), async (req, res) => {
  try {
    const storeId = req.user.storeId;
    if (!storeId) {
      return res.status(403).json({ success: false, message: 'Store ID required for store analytics' });
    }
    const kpis = await analyticsService.getStoreKPIs(storeId);
    res.json({ success: true, data: kpis });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/store/detailed', isAuthenticated, requirePermission('analytics_read'), async (req, res) => {
  try {
    const storeId = req.user.storeId;
    if (!storeId) {
      return res.status(403).json({ success: false, message: 'Store ID required for store analytics' });
    }
    
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Start and end dates are required' });
    }
    
    const stats = await analyticsService.getDetailedStoreAnalytics(storeId, startDate, endDate);
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
