const mongoose = require('mongoose');
const tenantPlugin = require('../plugins/tenantPlugin');

const categorySchema = new mongoose.Schema({
  storeId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  name:      { type: String, required: true },
  sortOrder: { type: Number, default: 0 },
  isActive:  { type: Boolean, default: true },
}, { timestamps: true });

categorySchema.plugin(tenantPlugin);
module.exports = mongoose.model('Category', categorySchema);