import socketAuth from '../middleware/socketAuth.js';

const registerCustomerNamespace = (io) => {
  const customerNsp = io.of('/customer');

  customerNsp.use(socketAuth);

  customerNsp.on('connection', (socket) => {
    const user = socket.data.user;
    console.log(`[/customer] Customer connected: ${user.userId}`);

    // Customers join a specific order room to track status
    socket.on('join:order', (orderId) => {
      socket.join(`order:${orderId}`);
      console.log(`Customer ${user.userId} joined order room: ${orderId}`);
      socket.emit('joined', { room: `order:${orderId}` });
    });

    // Synchronize order status on reconnect
    socket.on('order:sync', async (orderId) => {
      try {
        const apiUrl = process.env.API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/orders/${orderId}`, {
          headers: { 
            'Authorization': `Bearer ${socket.handshake.auth?.token}`,
            'x-store-id': user.storeId // Assuming tenant middleware might need this
          }
        });
        const data = await response.json();
        if (data.success) {
          socket.emit('order:status_changed', {
            orderId,
            status: data.data.status,
            synced: true
          });
        }
      } catch (err) {
        console.error('[/customer] Order sync failed:', err.message);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`[/customer] Customer disconnected: ${user.userId} — ${reason}`);
    });
  });

  return customerNsp;
};

export default registerCustomerNamespace;
