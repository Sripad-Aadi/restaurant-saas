import { Router } from 'express';
import * as authService from './auth.service.js';
import validate from '../../middleware/validate.js';
import { isAuthenticated } from '../../middleware/auth.js';
import { authLimiter } from '../../middleware/rateLimiter.js';
import { loginSchema, registerSchema } from './auth.validator.js';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), async (req, res) => {
  try {
    const { name, email, password, role, storeId } = req.body;
    const { accessToken, refreshToken, user } = await authService.register(name, email, password, role, storeId);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ success: true, accessToken, user });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

router.post('/login', authLimiter, validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;
    const { accessToken, refreshToken, user } = await authService.login(email, password);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ success: true, accessToken, user });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

router.post('/refresh-token', async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token missing' });
    }

    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId required' });
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await authService.refreshAccessToken(userId, refreshToken);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ success: true, accessToken });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

router.post('/logout', isAuthenticated, async (req, res) => {
  try {
    await authService.logout(req.user.userId);
    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/me', isAuthenticated, async (req, res) => {
  try {
    const user = await import('../../models/User.js').then(m => m.default.findById(req.user.id));
    res.json({ success: true, user: { ...req.user, notifications: user?.notifications } });
  } catch (err) {
    res.json({ success: true, user: req.user });
  }
});

router.patch('/profile', isAuthenticated, async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await authService.updateProfile(req.user.id, name, email);
    res.json({ success: true, user });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

router.patch('/password', isAuthenticated, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await authService.updatePassword(req.user.id, currentPassword, newPassword);
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

router.patch('/notifications', isAuthenticated, async (req, res) => {
  try {
    const { notifications } = req.body;
    const updatedNotifications = await authService.updateNotifications(req.user.id, notifications);
    res.json({ success: true, notifications: updatedNotifications });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

import { isSuperAdmin } from '../../middleware/auth.js';

router.post('/impersonate', isAuthenticated, isSuperAdmin, async (req, res) => {
  try {
    const { storeId } = req.body;
    if (!storeId) return res.status(400).json({ success: false, message: 'storeId is required' });

    const { accessToken, refreshToken, user } = await authService.impersonateStoreAdmin(storeId);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ success: true, accessToken, user });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

export default router;