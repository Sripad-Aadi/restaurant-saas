import { io } from 'socket.io-client';

export const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001/customer', {
  autoConnect: false,
  withCredentials: true,
  auth: (cb) => {
    cb({ token: localStorage.getItem('token') });
  }
});
