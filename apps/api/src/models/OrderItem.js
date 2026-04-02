const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  orderId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:      { type: String, required: true },  // snapshot at time of order
  price:     { type: Number, required: true },  // snapshot in paise
  quantity:  { type: Number, required: true, min: 1 },
}, { timestamps: true });

module.exports = mongoose.model('OrderItem', orderItemSchema);