import { Router } from 'express';
import * as paymentService from './payment.service.js';
import validate from '../../middleware/validate.js';
import { isAuthenticated } from '../../middleware/auth.js';
import tenant from '../../middleware/tenant.js';
import { initiatePaymentSchema } from './payment.validator.js';

const router = Router();

// POST /api/payments/initiate
router.post('/initiate', isAuthenticated, tenant, validate(initiatePaymentSchema), async (req, res) => {
  try {
    const result = await paymentService.initiatePayment(
      req.tenant.storeId,
      req.body.orderId
    );
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// POST /api/payments/webhook — unauthenticated, called by Razorpay
router.post('/webhook', async (req, res) => {
  try {
    const isDev = process.env.NODE_ENV !== 'production';
    const signature = req.headers['x-razorpay-signature'];

    // In production, signature is mandatory
    if (!isDev && !signature) {
      return res.status(400).json({ success: false, message: 'Missing signature header' });
    }

    // Use raw body if available (set by middleware), otherwise stringify req.body
    const rawBody = req.rawBody || JSON.stringify(req.body);

    await paymentService.handleWebhook(rawBody, signature);
    res.json({ success: true, received: true });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

export default router;