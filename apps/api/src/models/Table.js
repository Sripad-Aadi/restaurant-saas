const mongoose = require('mongoose');
const tenantPlugin = require('../plugins/tenantPlugin');

const tableSchema = new mongoose.Schema({
  storeId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  tableNumber: { type: Number, required: true },
  label:       { type: String },
  qrCodeUrl:   { type: String },
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });

tableSchema.plugin(tenantPlugin);
module.exports = mongoose.model('Table', tableSchema);