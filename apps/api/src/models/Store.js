import mongoose from 'mongoose';

const storeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Store name is required'],
      trim: true,
      maxlength: [100, 'Store name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'],
    },
    logo: {
      type: String, // Cloudinary URL
      default: null,
    },
    coverImage: {
      type: String, // Cloudinary URL
      default: null,
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    cuisineType: {
      type: String,
      trim: true,
      default: '',
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata',
    },
    avgWaitTime: {
      type: String, // e.g. "15–20 mins"
      default: '',
    },
    amenities: {
      wifi: { type: Boolean, default: false },
      ac: { type: Boolean, default: false },
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    // Razorpay credentials per store (encrypted at rest recommended)
    razorpay: {
      keyId: { type: String, default: null },
      keySecret: { type: String, default: null },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// --- Indexes ---
storeSchema.index({ isActive: 1, createdAt: -1 }); // superadmin listing

// --- Virtuals ---
storeSchema.virtual('menuUrl').get(function () {
  return `/menu/${this.slug}`;
});

// --- Hooks ---
// Strip Razorpay secrets from JSON responses by default
storeSchema.methods.toSafeJSON = function () {
  const obj = this.toObject();
  delete obj.razorpay;
  return obj;
};

export default mongoose.model('Store', storeSchema);