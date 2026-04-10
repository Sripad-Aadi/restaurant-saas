import roleGuard from '../middleware/roleGuard.js';

const registerOrdersNamespace = (io) => {
  const ordersNsp = io.of('/orders');

  ordersNsp.on('connection', (socket) => {
    const user = socket.data.user;
    console.log(`[/orders] connected: ${user.userId} (${user.role})`);

    // ── Join appropriate rooms based on role ─────────────────

    // Admins and Super Admins join the store-wide room
    // They receive ALL order events for their store
    socket.on('join:store', (storeId) => {
      try {
        roleGuard(socket, ['ADMIN', 'SUPER_ADMIN']);

        // Ensure admin only joins their own store room
        if (user.role === 'ADMIN' && user.storeId?.toString() !== storeId) {
          socket.emit('error', { message: 'Cannot join another store room' });
          return;
        }

        socket.join(`store:${storeId}`);
        console.log(`Admin ${user.userId} joined store:${storeId}`);
        socket.emit('joined', { room: `store:${storeId}` });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // Customers join a specific order room to track their order
    socket.on('join:order', (orderId) => {
      socket.join(`order:${orderId}`);
      console.log(`Customer ${user.userId} joined order:${orderId}`);
      socket.emit('joined', { room: `order:${orderId}` });
    });

    // Customers join a table room
    socket.on('join:table', (tableId) => {
      socket.join(`table:${tableId}`);
      console.log(`${user.userId} joined table:${tableId}`);
      socket.emit('joined', { room: `table:${tableId}` });
    });

    socket.on('disconnect', (reason) => {
      console.log(`[/orders] disconnected: ${user.userId} — ${reason}`);
    });
  });

  return ordersNsp;
};

export default registerOrdersNamespace;