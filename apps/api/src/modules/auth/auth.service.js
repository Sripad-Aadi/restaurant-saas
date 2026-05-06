import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import redis from '../../config/redis.js';
import User from '../../models/User.js';

const generateAccessToken = (user) => {
  return jwt.sign(
    { 
      userId: user._id, 
      role: user.role, 
      storeId: user.storeId,
      tokenVersion: user.tokenVersion || 0 
    },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
  );
};

const generateRefreshToken = async (userId) => {
  const token = uuidv4();
  await redis.set(`refresh:${userId}`, token, 'EX', 7 * 24 * 60 * 60);
  return token;
};

export const register = async (name, email, password, role, storeId) => {
  const existingUser = await User.findOne({ email, role });
  if (existingUser) throw { status: 400, message: 'User with this email and role already exists' };

  const user = await User.create({
    name,
    email,
    password, // Hash is handled by Mongoose pre-save hook
    role,
    storeId: storeId || null,
  });

  const accessToken = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user._id);

  return {
    accessToken,
    refreshToken,
    user: { id: user._id, name: user.name, email: user.email, role: user.role, storeId: user.storeId },
  };
};

export const login = async (email, password) => {
  // +password because select: false on the schema
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

export const impersonateStoreAdmin = async (storeId) => {
  const user = await User.findOne({ storeId, role: 'admin' }).sort({ createdAt: 1 });
  if (!user) throw { status: 404, message: 'No admin found for this store' };

  const accessToken = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user._id);

  return {
    accessToken,
    refreshToken,
    user: { id: user._id, name: user.name, email: user.email, role: user.role, storeId: user.storeId },
  };
};

export const updateProfile = async (userId, name, email) => {
  const user = await User.findById(userId);
  if (!user) throw { status: 404, message: 'User not found' };

  if (email && email !== user.email) {
    const existing = await User.findOne({ email, role: user.role });
    if (existing) throw { status: 400, message: 'Email already in use' };
  }

  if (name) user.name = name;
  if (email) user.email = email;

  await user.save();
  return { id: user._id, name: user.name, email: user.email, role: user.role, storeId: user.storeId, notifications: user.notifications };
};

export const updatePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  if (!user) throw { status: 404, message: 'User not found' };

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw { status: 400, message: 'Incorrect current password' };

  user.password = newPassword;
  await user.save();
  return true;
};

export const updateNotifications = async (userId, notifications) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { notifications } },
    { new: true }
  );
  if (!user) throw { status: 404, message: 'User not found' };
  return user.notifications;
};