import Redis from 'ioredis';

// The API emits events to the socket server via Redis pub/sub
// This avoids direct coupling between the two servers
const publisher = new Redis(process.env.REDIS_URL);

publisher.on('error', (err) => console.error('❌ Socket emitter Redis error:', err.message));

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