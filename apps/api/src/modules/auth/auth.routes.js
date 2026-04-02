const express = require('express');
const router = express.Router();
const authService = require('./auth.service');
const validate = require('../../middleware/validate');
const authenticate = require('../../middleware/auth');
const { authLimiter } = require('../../middleware/rateLimiter');
const { loginSchema } = require('./auth.validator');

// POST /api/auth/login
router.post('/login', authLimiter, validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;
    const { accessToken, refreshToken, user } = await authService.login(email, password);

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    });

    res.json({ success: true, accessToken, user });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token missing' });
    }

    // Decode without verifying to get userId (it's a UUID, not a JWT)
    // userId comes from the request body instead
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

// POST /api/auth/logout
router.post('/logout', authenticate, async (req, res) => {
  try {
    await authService.logout(req.user.userId);
    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/auth/me — verify token and return current user
router.get('/me', authenticate, async (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = router;