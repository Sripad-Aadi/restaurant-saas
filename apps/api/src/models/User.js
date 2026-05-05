import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export const USER_ROLES = {
  SUPER_ADMIN: 'superadmin',
  ADMIN: 'admin',
  CUSTOMER: 'customer',
};

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // never returned in queries by default
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      required: true,
    },
    // null for superadmin, required for admin/customer
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    // For forgot-password flow
    passwordResetToken: {
      type: String,
      select: false,
      default: null,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
      default: null,
    },
    tokenVersion: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// --- Indexes ---
// Unique email per role scope:
// superadmin emails are globally unique; admin emails unique per store
userSchema.index({ email: 1, role: 1 }, { unique: true });
userSchema.index({ storeId: 1, role: 1 });          // list admins/customers of a store
userSchema.index({ role: 1, isActive: 1 });           // superadmin user listing with filters
userSchema.index({ storeId: 1, email: 1 });           // fast login lookup scoped to store

// --- Hooks ---
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// --- Methods ---
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.isSuperAdmin = function () {
  return this.role === USER_ROLES.SUPER_ADMIN;
};

userSchema.methods.isAdmin = function () {
  return this.role === USER_ROLES.ADMIN;
};

// Safe payload for JWT
userSchema.methods.toTokenPayload = function () {
  return {
    id: this._id,
    role: this.role,
    storeId: this.storeId,
    email: this.email,
    tokenVersion: this.tokenVersion,
  };
};

export default mongoose.model('User', userSchema);