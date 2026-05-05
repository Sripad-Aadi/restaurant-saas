import { Router } from 'express';
import * as tableService from './table.service.js';
import validate from '../../middleware/validate.js';
import { isAuthenticated } from '../../middleware/auth.js';
import tenant from '../../middleware/tenant.js';
import requirePermission from '../../middleware/rbac.js';
import Store from '../../models/Store.js';
import { createTableSchema, updateTableSchema } from './table.validator.js';

const router = Router();

router.use(isAuthenticated, tenant, requirePermission('table_management'));

// GET /api/tables
router.get('/', async (req, res) => {
  try {
    const tables = await tableService.getTablesByStore(req.tenant.storeId);
    res.json({ success: true, data: tables });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// GET /api/tables/:id
router.get('/:id', async (req, res) => {
  try {
    const table = await tableService.getTableById(req.tenant.storeId, req.params.id);
    res.json({ success: true, data: table });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// POST /api/tables
router.post('/', validate(createTableSchema), async (req, res) => {
  try {
    // Need store slug for QR code URL generation
    const store = await Store.findById(req.tenant.storeId);
    if (!store) return res.status(404).json({ success: false, message: 'Store not found' });

    const table = await tableService.createTable(req.tenant.storeId, store.slug, req.body);
    res.status(201).json({ success: true, data: table });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// PATCH /api/tables/:id
router.patch('/:id', validate(updateTableSchema), async (req, res) => {
  try {
    const table = await tableService.updateTable(req.tenant.storeId, req.params.id, req.body);
    res.json({ success: true, data: table });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

export default router;