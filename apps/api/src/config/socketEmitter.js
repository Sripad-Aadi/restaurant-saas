import { Redis as UpstashRedis } from '@upstash/redis';
import IORedis from 'ioredis';

// The API emits events to the socket server via Redis pub/sub
// This avoids direct coupling between the two servers
let publisher;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  publisher = new UpstashRedis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  console.log('Socket Emitter initialized via Upstash REST');
} else {
  publisher = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');
  publisher.on('error', (err) => console.error('❌ Socket emitter Redis error:', err.message));
}

// Publish an event to a specific room in a namespace
export const emitToRoom = async (namespace, room, event, data) => {
  try {
    const message = JSON.stringify({ namespace, room, event, data });
    await publisher.publish('socket:emit', message);
  } catch (err) {
    console.error('Failed to emit socket event:', err.message);
  }
};

export default publisher;