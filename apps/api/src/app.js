import './config/env.js'; // must be first — loads .env before anything else
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import redis from './config/redis.js'; // initialises connection
import { standardLimiter } from './middleware/rateLimiter.js';
import authRoutes from './modules/auth/auth.routes.js';

const app = express();

connectDB();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(standardLimiter);

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

app.use('/api/auth', authRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  const message = process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message;
  res.status(err.status || 500).json({ success: false, message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 API server running on port ${PORT}`));