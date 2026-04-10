import dotenv from 'dotenv';
dotenv.config();

import { createServer } from 'http';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { pubClient, subClient } from './config/redis.js';
import socketAuth from './middleware/socketAuth.js';
import registerOrdersNamespace from './namespaces/orders.js';
import registerAnalyticsNamespace from './namespaces/analytics.js';

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin:      process.env.CLIENT_URL || 'http://localhost:3000',
    methods:     ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout:  60000,
  pingInterval: 25000,
});

io.adapter(createAdapter(pubClient, subClient));
io.use(socketAuth);

const ordersNsp    = registerOrdersNamespace(io);
const analyticsNsp = registerAnalyticsNamespace(io);

// ── Listen for events published by the API ───────────────────
const subscriber = subClient.duplicate();
subscriber.subscribe('socket:emit', (err) => {
  if (err) console.error('Failed to subscribe to socket:emit channel:', err.message);
});

subscriber.on('message', (channel, message) => {
  if (channel !== 'socket:emit') return;

  try {
    const { namespace, room, event, data } = JSON.parse(message);

    if (namespace === '/orders') {
      ordersNsp.to(room).emit(event, data);
    } else if (namespace === '/analytics') {
      analyticsNsp.to(room).emit(event, data);
    }
  } catch (err) {
    console.error('Failed to process socket:emit message:', err.message);
  }
});

const PORT = process.env.SOCKET_PORT || 5001;
httpServer.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`);
});

export { io };