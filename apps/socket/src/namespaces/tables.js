import roleGuard from '../middleware/roleGuard.js';
import socketAuth from '../middleware/socketAuth.js';

const registerTablesNamespace = (io) => {
  const tablesNsp = io.of('/tables');
  tablesNsp.use(socketAuth);

  tablesNsp.on('connection', (socket) => {
    const user = socket.data.user;
    console.log(`[/tables] connected: ${user.userId} (${user.role})`);

    // Admins join their store room to receive live table status updates
    socket.on('join:store', (storeId) => {
      try {
        roleGuard(socket, ['ADMIN', 'SUPER_ADMIN']);

        if (user.role === 'ADMIN' && user.storeId?.toString() !== storeId) {
          socket.emit('error', { message: 'Cannot join another store room' });
          return;
        }

        socket.join(`store:${storeId}`);
        console.log(`[/tables] ${user.userId} joined store:${storeId}`);
        socket.emit('joined', { room: `store:${storeId}` });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // Legacy support: admin-ui emits 'join' with a 'store:<id>' room string
    socket.on('join', (room) => {
      socket.join(room);
      console.log(`[/tables] ${user.userId} joined ${room}`);
      socket.emit('joined', { room });
    });

    socket.on('disconnect', (reason) => {
      console.log(`[/tables] disconnected: ${user.userId} — ${reason}`);
    });
  });

  return tablesNsp;
};

export default registerTablesNamespace;
