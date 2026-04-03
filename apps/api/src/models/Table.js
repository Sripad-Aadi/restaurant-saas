import mongoose from 'mongoose';
import tenantPlugin from '../plugins/tenantPlugin.js';

const tableSchema = new mongoose.Schema({
  storeId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  tableNumber: { type: Number, required: true },
  label:       { type: String },
  qrCodeUrl:   { type: String },
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });

tableSchema.plugin(tenantPlugin);

const Table = mongoose.model('Table', tableSchema);
export default Table;