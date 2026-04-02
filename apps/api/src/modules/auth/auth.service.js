const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const redis = require('../../config/redis');
const User = require('../../models/User');

// ── Token Generators ─────────────────────────────────────────

const generateAccessToken = (user) => {
  return jwt.sign(
    { userId: user._id, role: user.role, storeId: user.storeId },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
  );
};

const generateRefreshToken = async (userId) => {
  const token = uuidv4();
  const key = `refresh:${userId}`;
  const ttl = 7 * 24 * 60 * 60; // 7 days in seconds

  await redis.set(key, token, 'EX', ttl);
  return token;
};

// ── Login ────────────────────────────────────────────────────

const login = async (email, password) => {
  // Find user by email (email lookup doesn't need storeId)
  const user = await User.findOne({ email }).select('+password');
  if (!user) throw { status: 401, message: 'Invalid email' };

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw { status: 401, message: 'Invalid password' };

  const accessToken = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user._id);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      storeId: user.storeId,
    },
  };
};

// ── Refresh Token Rotation ───────────────────────────────────

const refreshAccessToken = async (userId, incomingRefreshToken) => {
  const key = `refresh:${userId}`;
  const storedToken = await redis.get(key);

  if (!storedToken || storedToken !== incomingRefreshToken) {
    throw { status: 401, message: 'Invalid or expired refresh token' };
  }

  // Fetch user to rebuild access token payload
  const user = await User.findById(userId);
  if (!user) throw { status: 401, message: 'User not found' };

  // Rotate: delete old, issue new
  await redis.del(key);
  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = await generateRefreshToken(user._id);

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

// ── Logout ───────────────────────────────────────────────────

const logout = async (userId) => {
  await redis.del(`refresh:${userId}`);
};

// ── Password Helper (used during user creation) ──────────────

const hashPassword = async (plainPassword) => {
  return bcrypt.hash(plainPassword, 12);
};

module.exports = { login, refreshAccessToken, logout, hashPassword, generateAccessToken };