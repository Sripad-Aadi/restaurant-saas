import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: [80, 'Category name cannot exceed 80 characters'],
    },
    description: {
      type: String,
      maxlength: [300, 'Description cannot exceed 300 characters'],
      default: '',
    },
    image: {
      type: String, // Cloudinary URL (optional)
      default: null,
    },
    sortOrder: {
      type: Number,
      default: 0, // lower = appears first; used by drag-to-reorder in admin UI
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// --- Indexes ---
categorySchema.index({ storeId: 1, isActive: 1, sortOrder: 1 }); // menu page fetch — most common query
categorySchema.index({ storeId: 1, name: 1 }, { unique: true });  // prevent duplicate names per store

export default mongoose.model('Category', categorySchema);