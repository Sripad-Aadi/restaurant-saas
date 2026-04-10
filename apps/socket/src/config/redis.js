import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

// Two separate clients needed for Redis pub/sub adapter
// — one for publishing, one for subscribing
const pubClient = new Redis(process.env.REDIS_URL);
const subClient = pubClient.duplicate();

pubClient.on('connect', () => console.log('Redis pub client connected'));
pubClient.on('error', (err) => console.error('Redis pub error:', err.message));
subClient.on('error', (err) => console.error('Redis sub error:', err.message));

export { pubClient, subClient };