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
