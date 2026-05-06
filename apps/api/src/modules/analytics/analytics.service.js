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
        status: 'COMPLETED',
        createdAt: { $gte: startOfMonth },
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$total' },
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
    status: 'COMPLETED',
  };

  // 1. Revenue Trend
  const revenueTrend = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$total' },
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
        revenue: { $sum: '$total' },
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

export const getStoreKPIs = async (storeId) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - 6);
  startOfWeek.setHours(0, 0, 0, 0);

  // Today's Orders & Revenue
  const todaysOrdersAggr = await Order.aggregate([
    { $match: { storeId, createdAt: { $gte: startOfDay, $lte: endOfDay } } },
    { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, '$total', 0] } } } }
  ]);
  const todaysOrders = todaysOrdersAggr[0]?.count || 0;
  const todaysRevenue = todaysOrdersAggr[0]?.revenue || 0;

  // Live Orders
  const liveOrders = await Order.countDocuments({ storeId, status: { $nin: ['COMPLETED', 'CANCELLED'] } });

  // Avg Order Value (Last 30 days)
  const startOfLast30Days = new Date();
  startOfLast30Days.setDate(startOfLast30Days.getDate() - 30);
  const avgOrderAggr = await Order.aggregate([
    { $match: { storeId, createdAt: { $gte: startOfLast30Days }, status: 'COMPLETED' } },
    { $group: { _id: null, avgAmount: { $avg: '$total' } } }
  ]);
  const avgOrderValue = avgOrderAggr[0]?.avgAmount || 0;

  // Recent Orders (limit 5)
  const recentOrdersRaw = await Order.find({ storeId })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('tableId');
    
  const recentOrders = recentOrdersRaw.map(order => {
    let itemsStr = '';
    if (order.items && order.items.length > 0) {
      itemsStr = order.items.map(i => `${i.name || 'Item'} ×${i.quantity}`).join(', ');
    }
    
    // Calculate time ago
    const diff = new Date() - new Date(order.createdAt);
    const mins = Math.floor(diff / 60000);
    const timeAgo = mins < 60 ? `${mins} min ago` : `${Math.floor(mins/60)} hr ago`;

    return {
      id: order.orderNumber || order._id.toString().substring(0,8),
      table: order.tableId ? `Table ${order.tableId.tableNumber || order.tableNumber}` : 'Takeaway',
      items: itemsStr || 'Custom Order',
      amount: order.total,
      status: order.status,
      time: timeAgo
    };
  });

  // Revenue Data (last 7 days)
  const revenueDataAggr = await Order.aggregate([
    { $match: { storeId, createdAt: { $gte: startOfWeek }, status: 'COMPLETED' } },
    {
      $group: {
        _id: { $dayOfWeek: '$createdAt' }, // 1 (Sun) to 7 (Sat)
        value: { $sum: '$total' }
      }
    }
  ]);
  
  const daysMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const revenueData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayName = daysMap[d.getDay()];
    const dayOfWeek = d.getDay() + 1;
    const dayData = revenueDataAggr.find(r => r._id === dayOfWeek);
    revenueData.push({
      name: dayName,
      value: dayData ? dayData.value : 0
    });
  }

  // Status Data
  const statusAggr = await Order.aggregate([
    { $match: { storeId } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  let completed = 0, inProgress = 0, cancelled = 0;
  statusAggr.forEach(s => {
    if (s._id === 'COMPLETED') completed += s.count;
    else if (s._id === 'CANCELLED') cancelled += s.count;
    else inProgress += s.count;
  });
  const totalStatus = completed + inProgress + cancelled;
  const statusData = totalStatus === 0 ? [
    { name: 'Completed', value: 0 },
    { name: 'In-Progress', value: 0 },
    { name: 'Cancelled', value: 0 }
  ] : [
    { name: 'Completed', value: Math.round((completed/totalStatus)*100) },
    { name: 'In-Progress', value: Math.round((inProgress/totalStatus)*100) },
    { name: 'Cancelled', value: Math.round((cancelled/totalStatus)*100) }
  ];

  // Top Items Today
  const topItemsAggr = await Order.aggregate([
    { $match: { storeId, createdAt: { $gte: startOfDay, $lte: endOfDay } } },
    { $unwind: '$items' },
    { $group: { _id: '$items.name', count: { $sum: '$items.quantity' } } },
    { $sort: { count: -1 } },
    { $limit: 3 }
  ]);
  
  const maxCount = topItemsAggr.length > 0 ? topItemsAggr[0].count : 1;
  const topItems = topItemsAggr.map(item => ({
    name: item._id,
    count: item.count,
    max: maxCount < 10 ? 10 : maxCount + 5
  }));

  return {
    todayOrders: todaysOrders,
    todayRevenue: todaysRevenue,
    liveOrders: liveOrders,
    avgOrderValue: Math.round(avgOrderValue),
    recentOrders,
    revenueData,
    statusData,
    topItems
  };
};

export const getDetailedStoreAnalytics = async (storeId, startDate, endDate) => {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  const matchStage = {
    storeId,
    createdAt: { $gte: start, $lte: end },
    status: 'COMPLETED',
  };

  // 1. Revenue Trend
  const revenueTrend = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$total' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // 2. Peak Hours
  const peakHours = await Order.aggregate([
    { $match: matchStage },
    {
      $project: {
        hour: { $hour: '$createdAt' },
      },
    },
    {
      $group: {
        _id: '$hour',
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id': 1 } },
  ]);
  
  const formattedPeakHours = [];
  for (let i = 0; i < 24; i++) {
    const hourData = peakHours.find(p => p._id === i);
    formattedPeakHours.push({
      hour: `${i.toString().padStart(2, '0')}:00`,
      orders: hourData ? hourData.count : 0
    });
  }

  // 3. Top Items
  const topItems = await Order.aggregate([
    { $match: matchStage },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.name',
        revenue: { $sum: '$items.subtotal' },
        count: { $sum: '$items.quantity' }
      }
    },
    { $sort: { revenue: -1 } },
    { $limit: 10 }
  ]);

  // 4. Category Breakdown
  const categoryBreakdown = await Order.aggregate([
    { $match: matchStage },
    { $unwind: '$items' },
    {
      $lookup: {
        from: 'products',
        localField: 'items.productId',
        foreignField: '_id',
        as: 'product'
      }
    },
    { $unwind: '$product' },
    {
      $lookup: {
        from: 'categories',
        localField: 'product.categoryId',
        foreignField: '_id',
        as: 'category'
      }
    },
    { $unwind: '$category' },
    {
      $group: {
        _id: '$category.name',
        revenue: { $sum: '$items.subtotal' },
        count: { $sum: '$items.quantity' }
      }
    },
    { $sort: { revenue: -1 } }
  ]);

  return {
    revenueTrend,
    peakHours: formattedPeakHours,
    topItems,
    categoryBreakdown
  };
};
