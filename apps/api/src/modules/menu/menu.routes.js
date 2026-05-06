import { Router } from 'express';
import * as menuService from './menu.service.js';

const router = Router();

// GET /api/menu/:storeSlug
// Public endpoint — no authentication required (Redis cached)
router.get('/:storeSlug', async (req, res) => {
  try {
    const data = await menuService.getMenuBySlug(req.params.storeSlug);
    res.json({ success: true, data });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

export default router;