import jwt from 'jsonwebtoken';

const socketAuth = (socket, next) => {
  try {
    // Token comes from socket handshake auth
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error('AUTH_ERROR: Access token required'));
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    socket.data.user = decoded; // { userId, role, storeId }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new Error('AUTH_ERROR: Access token expired'));
    }
    return next(new Error('AUTH_ERROR: Invalid access token'));
  }
};

export default socketAuth;