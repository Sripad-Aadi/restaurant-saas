import { Router } from 'express';
import * as productService from './product.service.js';
import validate from '../../middleware/validate.js';
import { isAuthenticated } from '../../middleware/auth.js';
import tenant from '../../middleware/tenant.js';
import requirePermission from '../../middleware/rbac.js';
import { createProductSchema, updateProductSchema } from './product.validator.js';

const router = Router();

router.use(isAuthenticated, tenant);

// GET /api/products?categoryId=...&isAvailable=true
router.get('/', requirePermission('menu_read'), async (req, res) => {
  try {
    const { categoryId, isAvailable } = req.query;
    const filters = {};
    if (categoryId) filters.categoryId = categoryId;
    if (isAvailable !== undefined) filters.isAvailable = isAvailable === 'true';

    const products = await productService.getProductsByStore(req.tenant.storeId, filters);
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// GET /api/products/:id
router.get('/:id', requirePermission('menu_read'), async (req, res) => {
  try {
    const product = await productService.getProductById(req.tenant.storeId, req.params.id);
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// POST /api/products
router.post('/', requirePermission('menu_write'), validate(createProductSchema), async (req, res) => {
  try {
    const product = await productService.createProduct(req.tenant.storeId, req.body);
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// PATCH /api/products/:id
router.patch('/:id', requirePermission('menu_write'), validate(updateProductSchema), async (req, res) => {
  try {
    const product = await productService.updateProduct(req.tenant.storeId, req.params.id, req.body);
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// PATCH /api/products/:id/toggle-availability
router.patch('/:id/toggle-availability', requirePermission('menu_write'), async (req, res) => {
  try {
    const product = await productService.toggleAvailability(req.tenant.storeId, req.params.id);
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// DELETE /api/products/:id
router.delete('/:id', requirePermission('menu_write'), async (req, res) => {
  try {
    await productService.deleteProduct(req.tenant.storeId, req.params.id);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

export default router;