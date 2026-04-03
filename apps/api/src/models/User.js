import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  storeId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ['SUPER_ADMIN', 'ADMIN', 'CUSTOMER'], required: true },
}, { timestamps: true });

userSchema.pre('find', function (next) {
  const filter = this.getFilter();
  if (filter.role === 'SUPER_ADMIN') return next();
  if (!filter.storeId && !filter.email) {
    return next(new Error('TENANT_VIOLATION: storeId required'));
  }
  next();
});

const User = mongoose.model('User', userSchema);
export default User;