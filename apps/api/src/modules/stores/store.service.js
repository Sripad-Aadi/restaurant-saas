import Store from '../../models/Store.js';
import User from '../../models/User.js';
import { hashPassword } from '../auth/auth.service.js';

export const createStore = async ({ name, slug, logo, timezone }, adminData) => {
  // Check slug uniqueness
  const existing = await Store.findOne({ slug });
  if (existing) throw { status: 409, message: 'A store with this slug already exists' };

  // Create the store
  const store = await Store.create({ name, slug, logo, timezone });

  // Create the first admin user linked to this store
  const hashedPassword = await hashPassword(adminData.password);
  const admin = await User.create({
    storeId: store._id,
    name:    adminData.name,
    email:   adminData.email,
    password: hashedPassword,
    role:    'ADMIN',
  });

  return {
    store,
    admin: { id: admin._id, name: admin.name, email: admin.email },
  };
};

export const getAllStores = async () => {
  return Store.find().sort({ createdAt: -1 });
};

export const getStoreById = async (id) => {
  const store = await Store.findById(id);
  if (!store) throw { status: 404, message: 'Store not found' };
  return store;
};

export const activateStore = async (id) => {
  const store = await Store.findByIdAndUpdate(id, { isActive: true }, { new: true });
  if (!store) throw { status: 404, message: 'Store not found' };
  return store;
};

export const deactivateStore = async (id) => {
  const store = await Store.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!store) throw { status: 404, message: 'Store not found' };
  return store;
};

export const updateStore = async (id, updates) => {
  const store = await Store.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  if (!store) throw { status: 404, message: 'Store not found' };
  return store;
};