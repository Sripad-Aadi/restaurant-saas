import AuditLog from '../../models/AuditLog.js';

export const createLog = async ({ userId, action, entityType, entityId, details, req }) => {
  try {
    const logData = {
      user: userId,
      action,
      entityType,
      entityId,
      details,
      ipAddress: req?.ip || req?.headers?.['x-forwarded-for'],
      userAgent: req?.headers?.['user-agent']
    };
    
    await AuditLog.create(logData);
  } catch (err) {
    console.error('Audit Log Creation Failed:', err);
    // Don't throw - we don't want to break the main flow if logging fails
  }
};

export const getLogs = async (filters = {}, options = {}) => {
  const { page = 1, limit = 50 } = options;
  const skip = (page - 1) * limit;

  const logs = await AuditLog.find(filters)
    .populate('user', 'name email role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await AuditLog.countDocuments(filters);

  return {
    logs,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit)
    }
  };
};
