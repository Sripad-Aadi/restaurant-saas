import { Router } from 'express';
import * as categoryService from './category.service.js';
import validate from '../../middleware/validate.js';
import { isAuthenticated } from '../../middleware/auth.js';
import tenant from '../../middleware/tenant.js';
import requirePermission from '../../middleware/rbac.js';
import {
  createCategorySchema,
  updateCategorySchema,
  reorderCategorySchema,
} from './category.validator.js';

const router = Router();

router.use(isAuthenticated, tenant);

// GET /api/categories
router.get('/', requirePermission('menu_read'), async (req, res) => {
  try {
    const categories = await categoryService.getCategoriesByStore(req.tenant.storeId);
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// GET /api/categories/:id
router.get('/:id', requirePermission('menu_read'), async (req, res) => {
  try {
    const category = await categoryService.getCategoryById(req.tenant.storeId, req.params.id);
    res.json({ success: true, data: category });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// POST /api/categories
router.post('/', requirePermission('menu_write'), validate(createCategorySchema), async (req, res) => {
  try {
    const category = await categoryService.createCategory(req.tenant.storeId, req.body);
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// PATCH /api/categories/:id
router.patch('/:id', requirePermission('menu_write'), validate(updateCategorySchema), async (req, res) => {
  try {
    const category = await categoryService.updateCategory(req.tenant.storeId, req.params.id, req.body);
    res.json({ success: true, data: category });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// PATCH /api/categories/:id/reorder
router.patch('/:id/reorder', requirePermission('menu_write'), validate(reorderCategorySchema), async (req, res) => {
  try {
    const category = await categoryService.reorderCategory(
      req.tenant.storeId, req.params.id, req.body.sortOrder
    );
    res.json({ success: true, data: category });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// DELETE /api/categories/:id
router.delete('/:id', requirePermission('menu_write'), async (req, res) => {
  try {
    await categoryService.deleteCategory(req.tenant.storeId, req.params.id);
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

export default router;