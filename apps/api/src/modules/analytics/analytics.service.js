import Store from '../../models/Store.js';
import Order from '../../models/Order.js';

export const getSuperAdminKPIs = async () => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [totalStores, activeStores, todaysOrders] = await Promise.all([
    Store.countDocuments(),
    Store.countDocuments({ isActive: true }),
    Order.countDocuments({ createdAt: { $gte: startOfDay, $lte: endOfDay } }),
  ]);

  const revenueResult = await Order.aggregate([
    {
      $match: {
        status: 'DELIVERED',
        createdAt: { $gte: startOfMonth },
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalAmount' },
      },
    },
  ]);

  const monthlyRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

  return {
    totalStores,
    activeStores,
    todaysOrders,
    monthlyRevenue,
  };
};

export const getDetailedPlatformAnalytics = async (startDate, endDate) => {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  const matchStage = {
    createdAt: { $gte: start, $lte: end },
    status: 'DELIVERED',
  };

  // 1. Revenue Trend
  const revenueTrend = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$totalAmount' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // 2. Peak Hours Heatmap
  const peakHours = await Order.aggregate([
    { $match: matchStage },
    {
      $project: {
        hour: { $hour: '$createdAt' },
        dayOfWeek: { $dayOfWeek: '$createdAt' }, // 1 (Sun) to 7 (Sat)
      },
    },
    {
      $group: {
        _id: { hour: '$hour', dayOfWeek: '$dayOfWeek' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.dayOfWeek': 1, '_id.hour': 1 } },
  ]);

  // 3. Store Performance
  const storePerformance = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$storeId',
        revenue: { $sum: '$totalAmount' },
        orders: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'stores',
        localField: '_id',
        foreignField: '_id',
        as: 'store',
      },
    },
    { $unwind: '$store' },
    {
      $project: {
        name: '$store.name',
        slug: '$store.slug',
        revenue: 1,
        orders: 1,
      },
    },
    { $sort: { revenue: -1 } },
  ]);

  return {
    revenueTrend,
    peakHours,
    storePerformance,
  };
};
