import mongoose from 'mongoose';

const storeSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  slug:     { type: String, required: true, unique: true, lowercase: true },
  logo:     { type: String },
  timezone: { type: String, default: 'Asia/Kolkata' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Store = mongoose.model('Store', storeSchema);
export default Store;