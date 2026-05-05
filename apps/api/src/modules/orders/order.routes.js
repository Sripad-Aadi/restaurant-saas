import { Router } from 'express';
import * as orderService from './order.service.js';
import validate from '../../middleware/validate.js';
import { isAuthenticated } from '../../middleware/auth.js';
import tenant from '../../middleware/tenant.js';
import requirePermission from '../../middleware/rbac.js';
import { createOrderSchema, updateOrderStatusSchema } from './order.validator.js';

const router = Router();

router.use(isAuthenticated, tenant);

// POST /api/orders — customer creates an order
router.post('/', requirePermission('order_create'), validate(createOrderSchema), async (req, res) => {
  try {
    const { order, isDuplicate } = await orderService.createOrder(
      req.tenant.storeId,
      req.user.userId,
      req.body
    );

    res.status(isDuplicate ? 200 : 201).json({
      success: true,
      isDuplicate,
      data: order,
    });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// GET /api/orders — admin gets all orders for their store
router.get('/', requirePermission('order_read_all'), async (req, res) => {
  try {
    const { status, limit } = req.query;
    const orders = await orderService.getOrdersByStore(
      req.tenant.storeId,
      { status, limit: limit ? parseInt(limit) : 50 }
    );
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// GET /api/orders/my — customer gets their own orders
router.get('/my', requirePermission('order_read_own'), async (req, res) => {
  try {
    const orders = await orderService.getCustomerOrders(
      req.tenant.storeId,
      req.user.userId
    );
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// GET /api/orders/:id — get single order with items
router.get('/:id', async (req, res) => {
  try {
    const order = await orderService.getOrderById(req.tenant.storeId, req.params.id);

    // Customers can only see their own orders
    if (req.user.role === 'CUSTOMER' &&
        order.customerId?.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// PATCH /api/orders/:id/status — admin updates order status
router.patch(
  '/:id/status',
  requirePermission('order_status_update'),
  validate(updateOrderStatusSchema),
  async (req, res) => {
    try {
      const order = await orderService.updateOrderStatus(
        req.tenant.storeId,
        req.params.id,
        req.body.status
      );
      res.json({ success: true, data: order });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  }
);

export default router;