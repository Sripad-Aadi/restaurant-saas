import { Router } from 'express';
import * as storeService from './store.service.js';
import validate from '../../middleware/validate.js';
import { isAuthenticated } from '../../middleware/auth.js';
import requirePermission from '../../middleware/rbac.js';
import { createStoreSchema, updateStoreSchema } from './store.validator.js';

const router = Router();

// All store routes require authentication + platform_management permission
router.use(isAuthenticated, requirePermission('platform_management'));

// GET /api/stores — list all stores
router.get('/', async (req, res) => {
  try {
    const stores = await storeService.getAllStores();
    res.json({ success: true, data: stores });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// GET /api/stores/:id — get single store
router.get('/:id', async (req, res) => {
  try {
    const store = await storeService.getStoreById(req.params.id);
    res.json({ success: true, data: store });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// POST /api/stores — create store + first admin user
router.post('/', validate(createStoreSchema), async (req, res) => {
  try {
    const { name, slug, logo, timezone } = req.body;

    // Admin credentials must be passed in request body
    const { adminName, adminEmail, adminPassword } = req.body;
    if (!adminName || !adminEmail || !adminPassword) {
      return res.status(400).json({
        success: false,
        message: 'adminName, adminEmail and adminPassword are required',
      });
    }

    const result = await storeService.createStore(
      { name, slug, logo, timezone },
      { name: adminName, email: adminEmail, password: adminPassword }
    );

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// PATCH /api/stores/:id — update store details
router.patch('/:id', validate(updateStoreSchema), async (req, res) => {
  try {
    const store = await storeService.updateStore(req.params.id, req.body);
    res.json({ success: true, data: store });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// PATCH /api/stores/:id/activate
router.patch('/:id/activate', async (req, res) => {
  try {
    const store = await storeService.activateStore(req.params.id);
    res.json({ success: true, data: store });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// PATCH /api/stores/:id/deactivate
router.patch('/:id/deactivate', async (req, res) => {
  try {
    const store = await storeService.deactivateStore(req.params.id);
    res.json({ success: true, data: store });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

export default router;