const tenant = (req, res, next) => {
  // Super Admin has no storeId — they operate across all tenants
  if (req.user?.role === 'SUPER_ADMIN') return next();

  const storeId = req.user?.storeId;
  if (!storeId) {
    return res.status(403).json({ success: false, message: 'Tenant context missing' });
  }

  req.tenant = { storeId };
  next();
};

module.exports = tenant;