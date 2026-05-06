import socketAuth from '../middleware/socketAuth.js';
import roleGuard from '../middleware/roleGuard.js';

const registerAdminNamespace = (io) => {
  const adminNsp = io.of('/admin');

  adminNsp.use(socketAuth);
  
  // Custom middleware to ensure only admins can connect to this namespace
  adminNsp.use((socket, next) => {
    try {
      roleGuard(socket, ['admin', 'superadmin']);
      next();
    } catch (err) {
      next(err);
    }
  });

  adminNsp.on('connection', (socket) => {
    const user = socket.data.user;
    console.log(`[/admin] Admin connected: ${user.userId} for store: ${user.storeId}`);

    // Admin joins their store's room automatically upon connection
    if (user.storeId) {
      socket.join(`store:${user.storeId}`);
      socket.emit('joined', { room: `store:${user.storeId}` });
    }

    socket.on('disconnect', (reason) => {
      console.log(`[/admin] Admin disconnected: ${user.userId} — ${reason}`);
    });
  });

  return adminNsp;
};

export default registerAdminNamespace;
