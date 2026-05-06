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

    socket.on('disconnect', (reason) => {
      console.log(`[/customer] Customer disconnected: ${user.userId} — ${reason}`);
    });
  });

  return customerNsp;
};

export default registerCustomerNamespace;
