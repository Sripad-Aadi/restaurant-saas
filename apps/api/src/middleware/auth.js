import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ROLES } from '@restaurant-saas/shared';

export const isAuthenticated = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    
    // Support both 'id' and 'userId' for backward compatibility
    const userId = decoded.id || decoded.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Invalid token payload' });
    }

    // Support guest tokens (stateless)
    if (decoded.isGuest) {
      req.user = {
        id: userId,
        userId: userId,
        role: decoded.role || 'customer',
        storeId: decoded.storeId,
        isGuest: true
      };
      return next();
    }

    // Fetch user from DB to verify existence and session version
    const user = await User.findById(userId).select('+tokenVersion');
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    // Force logout check (Session versioning)
    const currentVersion = user.tokenVersion || 0;
    const tokenVersion = decoded.tokenVersion || 0;

    if (currentVersion !== tokenVersion) {
      return res.status(401).json({ success: false, message: 'Session expired or forced logout' });
    }

    // Attach user to request - use plain object to avoid Mongoose issues in other middlewares
    req.user = user.toObject();
    req.user.id = user._id.toString();
    req.user.userId = user._id.toString();
    
    next();
  } catch (err) {
    console.error('Authentication Error:', err.message);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Access token expired' });
    }
    return res.status(401).json({ success: false, message: 'Invalid access token' });
  }
};

export const isAdmin = (req, res, next) => {
  const role = req.user?.role;
  if (role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN) {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Admin privileges required' });
  }
};

export const isSuperAdmin = (req, res, next) => {
  const role = req.user?.role;
  if (role === ROLES.SUPER_ADMIN) {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Super Admin privileges required' });
  }
};