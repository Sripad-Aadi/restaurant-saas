import { Redis as UpstashRedis } from '@upstash/redis';
import IORedis from 'ioredis';

let redis;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  // Use Upstash REST client (Serverless/Free Deployment)
  redis = new UpstashRedis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  
  // Add a standardized helper for expiration
  redis.setEx = (key, seconds, value) => redis.set(key, value, { ex: seconds });
  
  console.log('Redis initialized via Upstash REST');
} else {
  // Use ioredis (Development/Self-Hosted TCP)
  redis = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');
  
  // Add a standardized helper for expiration
  redis.setEx = (key, seconds, value) => redis.set(key, value, 'EX', seconds);
  
  redis.on('connect', () => console.log('Redis connected via TCP'));
  redis.on('error', (err) => console.error('Redis error:', err.message));
}

export default redis;