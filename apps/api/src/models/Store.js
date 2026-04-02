const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  slug:      { type: String, required: true, unique: true, lowercase: true },
  logo:      { type: String },
  timezone:  { type: String, default: 'Asia/Kolkata' },
  isActive:  { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Store', storeSchema);