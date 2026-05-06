import mongoose from 'mongoose';
import Store from '../../models/Store.js';
import User from '../../models/User.js';
import Order from '../../models/Order.js';
import Product from '../../models/Product.js';
import { invalidateMenuCache } from '../menu/menu.service.js';

export const createStore = async (storeData, adminData) => {
  // Check slug uniqueness
  const existing = await Store.findOne({ slug: storeData.slug });
  if (existing) throw { status: 409, message: 'A store with this slug already exists' };

  let store;
  try {
    // Create the store
    store = await Store.create(storeData);

    // Create the first admin user linked to this store
    // Password hashing is handled automatically by User.js pre-save hook
    const admin = await User.create({
      storeId: store._id,
      name:    adminData.name,
      email:   adminData.email,
      password: adminData.password,
      role:    'admin',
    });

    return {
      store,
      admin: { id: admin._id, name: admin.name, email: admin.email },
    };
  } catch (error) {
    // Manual compensation: if user creation fails, delete the store to maintain atomicity
    if (store && store._id) {
      await Store.findByIdAndDelete(store._id);
    }
    throw error;
  }
};

export const getAllStores = async (filters = {}) => {
  const { search, status, page = 1, limit = 10, includeStats = false } = filters;
  
  const query = {};
  if (status && status !== 'all') {
    query.isActive = status === 'true';
  }
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { slug: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (page - 1) * limit;

  let data;
  if (includeStats) {
    data = await Store.aggregate([
      { $match: query },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: Number(limit) },
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'storeId',
          as: 'orderStats'
        }
      },
      {
        $addFields: {
          orderCount: { $size: '$orderStats' },
          totalRevenue: {
            $sum: {
              $map: {
                input: '$orderStats',
                as: 'order',
                in: {
                  $cond: [
                    { $in: ['$$order.status', ['COMPLETED', 'DELIVERED', 'READY']] },
                    '$$order.total',
                    0
                  ]
                }
              }
            }
          }
        }
      },
      {
        $project: {
          orderStats: 0
        }
      }
    ]);
  } else {
    data = await Store.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
  }

  const total = await Store.countDocuments(query);

  return {
    data,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit)
    }
  };
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
  
  await invalidateMenuCache(store._id);
  return store;
};

export const getStoreOrders = async (storeId) => {
  return Order.find({ storeId }).sort({ createdAt: -1 }).limit(100);
};

export const getStoreProducts = async (storeId) => {
  return Product.find({ storeId }).populate('categoryId').sort({ name: 1 });
};

export const getStoreAnalytics = async (storeId) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const stats = await Order.aggregate([
    { 
      $match: { 
        storeId: new mongoose.Types.ObjectId(storeId), 
        createdAt: { $gte: sevenDaysAgo },
        status: { $in: ['COMPLETED', 'DELIVERED'] }
      } 
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        revenue: { $sum: "$total" },
        orders: { $sum: 1 }
      }
    },
    { $sort: { "_id": 1 } }
  ]);

  return stats;
};

export const resetStoreAdminPassword = async (storeId, newPassword) => {
  const admin = await User.findOne({ storeId, role: 'admin' });
  if (!admin) throw { status: 404, message: 'Primary admin not found for this store' };

  admin.password = newPassword;
  await admin.save();
  return { success: true, message: 'Admin password reset successfully' };
};