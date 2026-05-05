/**
 * db.js — MongoDB connection + index bootstrap
 *
 * Usage in apps/api/src/server.js:
 *   import { connectDB } from './db.js';
 *   await connectDB();
 */

import mongoose from 'mongoose';

// Import all models so Mongoose registers them before ensureIndexes runs
import '../models/index.js';

export async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI environment variable is not set');

  try {
    await mongoose.connect(uri, {
      // Recommended for multi-tenant workloads — keeps connection pool warm
      maxPoolSize: 20,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`MongoDB connected: ${mongoose.connection.host}`);

    // In production, indexes are created via migration scripts — not at startup.
    // In development, syncIndexes() ensures all schema indexes exist.
    if (process.env.NODE_ENV !== 'production') {
      await syncAllIndexes();
    }
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

async function syncAllIndexes() {
  const models = Object.values(mongoose.models);
  console.log(`Syncing indexes for ${models.length} models...`);
  await Promise.all(models.map((m) => m.syncIndexes()));
  console.log('All indexes synced');
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed on SIGINT');
  process.exit(0);
});