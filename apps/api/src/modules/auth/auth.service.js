import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import redis from '../../config/redis.js';
import User from '../../models/User.js';

const generateAccessToken = (user) => {
  return jwt.sign(
    { userId: user._id, role: user.role, storeId: user.storeId },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
  );
};

const generateRefreshToken = async (userId) => {
  const token = uuidv4();
  await redis.set(`refresh:${userId}`, token, 'EX', 7 * 24 * 60 * 60);
  return token;
};

export const login = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) throw { status: 401, message: 'Invalid email or password' };

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw { status: 401, message: 'Invalid email or password' };

  const accessToken = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user._id);

  return {
    accessToken,
    refreshToken,
    user: { id: user._id, name: user.name, email: user.email, role: user.role, storeId: user.storeId },
  };
};

export const refreshAccessToken = async (userId, incomingRefreshToken) => {
  const storedToken = await redis.get(`refresh:${userId}`);
  if (!storedToken || storedToken !== incomingRefreshToken) {
    throw { status: 401, message: 'Invalid or expired refresh token' };
  }

  const user = await User.findById(userId);
  if (!user) throw { status: 401, message: 'User not found' };

  await redis.del(`refresh:${userId}`);
  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = await generateRefreshToken(user._id);

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

export const logout = async (userId) => {
  await redis.del(`refresh:${userId}`);
};

export const hashPassword = async (plainPassword) => {
  return bcrypt.hash(plainPassword, 12);
};