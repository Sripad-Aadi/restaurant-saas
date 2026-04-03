import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  storeId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  role:     { type: String, enum: ['SUPER_ADMIN', 'ADMIN', 'CUSTOMER'], required: true },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;