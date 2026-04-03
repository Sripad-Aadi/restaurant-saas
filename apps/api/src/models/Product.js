import mongoose from 'mongoose';
import tenantPlugin from '../plugins/tenantPlugin.js';

const productSchema = new mongoose.Schema({
  storeId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  categoryId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  name:        { type: String, required: true },
  description: { type: String },
  price:       { type: Number, required: true },
  imageUrl:    { type: String },
  isAvailable: { type: Boolean, default: true },
  sortOrder:   { type: Number, default: 0 },
}, { timestamps: true });

productSchema.index({ storeId: 1, categoryId: 1 });
productSchema.plugin(tenantPlugin);

const Product = mongoose.model('Product', productSchema);
export default Product;