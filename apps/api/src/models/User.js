const mongoose = require('mongoose');
const tenantPlugin = require('../plugins/tenantPlugin');

const userSchema = new mongoose.Schema({
  storeId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ['SUPER_ADMIN', 'ADMIN', 'CUSTOMER'], required: true },
}, { timestamps: true });

// Only apply tenant plugin to ADMIN and CUSTOMER — SUPER_ADMIN has no storeId
userSchema.plugin((schema) => {
  schema.pre('find', function(next) {
    const filter = this.getFilter();
    // Super admin queries won't have storeId — allow them through
    if (filter.role === 'SUPER_ADMIN') return next();
    if (!filter.storeId && !filter.email) {
      return next(new Error('TENANT_VIOLATION: storeId required'));
    }
    next();
  });
});

module.exports = mongoose.model('User', userSchema);