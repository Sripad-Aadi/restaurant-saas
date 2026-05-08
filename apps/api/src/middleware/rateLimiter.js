import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import redis from '../config/redis.js';

// Use RedisStore only if using TCP (ioredis). 
// For Upstash REST, we fall back to memory store to avoid Lua script complexity.
const getStore = (prefix) => {
  return redis.call 
    ? new RedisStore({
        prefix,
        sendCommand: (...args) => redis.call(...args),
      })
    : undefined; // undefined defaults to memory store
};

export const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  store: getStore('rl:standard:'),
  message: { success: false, message: 'Too many requests, please try again later' },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: getStore('rl:auth:'),
  message: { success: false, message: 'Too many login attempts, please try again in 15 minutes' },
});