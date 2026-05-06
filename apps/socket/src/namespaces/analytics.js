import roleGuard from '../middleware/roleGuard.js';
import socketAuth from '../middleware/socketAuth.js';

const registerAnalyticsNamespace = (io) => {
  const analyticsNsp = io.of('/analytics');
  analyticsNsp.use(socketAuth);

  analyticsNsp.on('connection', (socket) => {
    const user = socket.data.user;
    console.log(`[/analytics] connected: ${user.userId} (${user.role})`);

    socket.on('join:analytics', (storeId) => {
      try {
        roleGuard(socket, ['ADMIN', 'SUPER_ADMIN']);

        if (user.role === 'ADMIN' && user.storeId?.toString() !== storeId) {
          socket.emit('error', { message: 'Cannot join another store analytics room' });
          return;
        }

        socket.join(`analytics:${storeId}`);
        console.log(`${user.userId} joined analytics:${storeId}`);
        socket.emit('joined', { room: `analytics:${storeId}` });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`[/analytics] disconnected: ${user.userId} — ${reason}`);
    });
  });

  return analyticsNsp;
};

export default registerAnalyticsNamespace;