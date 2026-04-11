import { io } from 'socket.io-client';

export const createSocketConnection = (namespace, token) => {
  const socketURL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';
  return io(`${socketURL}${namespace}`, {
    auth: { token },
    autoConnect: false,
    withCredentials: true,
  });
};
