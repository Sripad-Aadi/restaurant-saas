import mongoose from 'mongoose';
import tenantPlugin from '../plugins/tenantPlugin.js';

const categorySchema = new mongoose.Schema({
  storeId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  name:      { type: String, required: true },
  sortOrder: { type: Number, default: 0 },
  isActive:  { type: Boolean, default: true },
}, { timestamps: true });

categorySchema.plugin(tenantPlugin);

const Category = mongoose.model('Category', categorySchema);
export default Category;