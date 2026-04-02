const tenantPlugin = (schema) => {
  // Enforce storeId on all queries
  const requireStoreId = function (next) {
    const filter = this.getFilter ? this.getFilter() : this._conditions;
    if (!filter.storeId) {
      return next(new Error('TENANT_VIOLATION: storeId is required on all queries'));
    }
    next();
  };

  schema.pre('find', requireStoreId);
  schema.pre('findOne', requireStoreId);
  schema.pre('findOneAndUpdate', requireStoreId);
  schema.pre('updateOne', requireStoreId);
  schema.pre('updateMany', requireStoreId);
  schema.pre('deleteOne', requireStoreId);
  schema.pre('deleteMany', requireStoreId);

  // Enforce storeId on saves
  schema.pre('save', function (next) {
    if (!this.storeId) {
      return next(new Error('TENANT_VIOLATION: storeId is required'));
    }
    next();
  });
};

module.exports = tenantPlugin;