const tenantPlugin = (schema) => {
  const requireStoreId = function () {
    const filter = this.getFilter();

    // Allow queries by _id alone — used by system-level operations
    // like webhook handlers and internal service calls
    const keys = Object.keys(filter);
    if (keys.length === 1 && keys[0] === '_id') return;

    if (!filter.storeId) {
      throw new Error('TENANT_VIOLATION: storeId is required on all queries');
    }
  };

  schema.pre('find', requireStoreId);
  schema.pre('findOne', requireStoreId);
  schema.pre('findOneAndUpdate', requireStoreId);
  schema.pre('updateOne', requireStoreId);
  schema.pre('updateMany', requireStoreId);
  schema.pre('deleteOne', requireStoreId);
  schema.pre('deleteMany', requireStoreId);

  schema.pre('save', function () {
    if (!this.storeId) {
      throw new Error('TENANT_VIOLATION: storeId is required');
    }
  });
};

export default tenantPlugin;