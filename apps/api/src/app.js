import './config/env.js';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db.js';
import redis from './config/redis.js';
import { standardLimiter } from './middleware/rateLimiter.js';

import authRoutes from './modules/auth/auth.routes.js';
import storeRoutes from './modules/stores/store.routes.js';
import categoryRoutes from './modules/categories/category.routes.js';
import productRoutes from './modules/products/product.routes.js';
import tableRoutes from './modules/tables/table.routes.js';
import menuRoutes from './modules/menu/menu.routes.js';
import orderRoutes from './modules/orders/order.routes.js';
import paymentRoutes from './modules/payments/payment.routes.js';

const app = express();

connectDB();

app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:3001'], credentials: true }));
app.use(cookieParser());

// Webhook route needs raw body — must be registered BEFORE express.json()
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }), (req, res, next) => {
  req.rawBody = req.body.toString('utf8');
  next();
});

// All other routes use JSON parsing
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

app.use('/api/auth', authRoutes);
app.use('/api/stores', standardLimiter, storeRoutes);
app.use('/api/categories', standardLimiter, categoryRoutes);
app.use('/api/products', standardLimiter, productRoutes);
app.use('/api/tables', standardLimiter, tableRoutes);
app.use('/api/menu', standardLimiter, menuRoutes);
app.use('/api/orders', standardLimiter, orderRoutes);
app.use('/api/payments', standardLimiter, paymentRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  const message = process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message;
  res.status(err.status || 500).json({ success: false, message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API server running on port ${PORT}`));