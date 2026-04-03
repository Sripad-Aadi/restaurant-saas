const tenant = (req, res, next) => {
  if (req.user?.role === 'SUPER_ADMIN') return next();

  const storeId = req.user?.storeId;
  if (!storeId) {
    return res.status(403).json({ success: false, message: 'Tenant context missing' });
  }

  req.tenant = { storeId };
  next();
};

export default tenant;