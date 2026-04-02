const mongoose = require('mongoose');
const tenantPlugin = require('../plugins/tenantPlugin');

const productSchema = new mongoose.Schema({
  storeId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  categoryId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  name:        { type: String, required: true },
  description: { type: String },
  price:       { type: Number, required: true }, // stored in paise
  imageUrl:    { type: String },
  isAvailable: { type: Boolean, default: true },
  sortOrder:   { type: Number, default: 0 },
}, { timestamps: true });

productSchema.index({ storeId: 1, categoryId: 1 });
productSchema.plugin(tenantPlugin);
module.exports = mongoose.model('Product', productSchema);