import User from '../../models/User.js';

export const getAllUsers = async (filters = {}) => {
  const query = {};
  if (filters.role) query.role = filters.role;
  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { email: { $regex: filters.search, $options: 'i' } },
    ];
  }

  const users = await User.find(query)
    .populate('storeId', 'name slug')
    .sort({ createdAt: -1 });

  return users;
};

export const forceLogout = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  user.tokenVersion += 1;
  await user.save();
  return true;
};

export const toggleUserStatus = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  user.isActive = !user.isActive;
  // If deactivating, also force logout
  if (!user.isActive) {
    user.tokenVersion += 1;
  }
  await user.save();
  return user;
};

export const createUser = async (userData) => {
  const existing = await User.findOne({ email: userData.email, role: userData.role });
  if (existing) {
    throw new Error('User with this email and role already exists');
  }

  const user = await User.create(userData);
  return user;
};

export const updateUser = async (userId, userData) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  // Handle password update separately if provided
  if (userData.password) {
    user.password = userData.password;
  }

  // Update other fields
  const allowedUpdates = ['name', 'email', 'role', 'storeId', 'isActive'];
  allowedUpdates.forEach(field => {
    if (userData[field] !== undefined) {
      user[field] = userData[field];
    }
  });

  await user.save();
  return user;
};