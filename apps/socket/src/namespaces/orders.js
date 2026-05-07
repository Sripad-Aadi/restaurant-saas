import roleGuard from '../middleware/roleGuard.js';
import socketAuth from '../middleware/socketAuth.js';

const registerOrdersNamespace = (io) => {
  const ordersNsp = io.of('/orders');
  ordersNsp.use(socketAuth);

  ordersNsp.on('connection', (socket) => {
    const user = socket.data.user;

    // ── Join appropriate rooms based on role ─────────────────

    // Admins and Super Admins join the store-wide room
    // They receive ALL order events for their store
    socket.on('join:store', (storeId) => {
      try {
        roleGuard(socket, ['admin', 'superadmin']);

        // Ensure admin only joins their own store room
        if (user.role === 'admin' && user.storeId?.toString() !== storeId) {
          socket.emit('error', { message: 'Cannot join another store room' });
          return;
        }

        socket.join(`store:${storeId}`);
        socket.emit('joined', { room: `store:${storeId}` });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // Customers join a specific order room to track their order
    socket.on('join:order', (orderId) => {
      socket.join(`order:${orderId}`);
      socket.emit('joined', { room: `order:${orderId}` });
    });

    // Customers join a table room
    socket.on('join:table', (tableId) => {
      socket.join(`table:${tableId}`);
      socket.emit('joined', { room: `table:${tableId}` });
    });

    socket.on('disconnect', (reason) => {
    });
  });

  return ordersNsp;
};

export default registerOrdersNamespace;