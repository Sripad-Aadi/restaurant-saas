import { Router } from 'express';
import * as subService from './subscription.service.js';
import { isAuthenticated, isSuperAdmin } from '../../middleware/auth.js';

const router = Router();

// All routes are SuperAdmin only
router.use(isAuthenticated, isSuperAdmin);

router.get('/plans', async (req, res) => {
  try {
    const plans = await subService.getAllPlans();
    res.json({ success: true, data: plans });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/plans', async (req, res) => {
  try {
    const plan = await subService.createPlan(req.body);
    res.json({ success: true, data: plan });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch('/plans/:id', async (req, res) => {
  try {
    const plan = await subService.updatePlan(req.params.id, req.body);
    res.json({ success: true, data: plan });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/active', async (req, res) => {
  try {
    const subs = await subService.getActiveSubscriptions();
    res.json({ success: true, data: subs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
