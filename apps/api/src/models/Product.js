import mongoose from 'mongoose';

export const FOOD_TYPE = {
  VEG: 'veg',
  NON_VEG: 'non-veg',
  EGG: 'egg',
};

const productSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [120, 'Product name cannot exceed 120 characters'],
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    image: {
      type: String, // Cloudinary URL
      default: null,
    },
    foodType: {
      type: String,
      enum: Object.values(FOOD_TYPE),
      default: FOOD_TYPE.VEG,
    },
    allergens: {
      type: [String], // e.g. ['nuts', 'dairy', 'gluten']
      default: [],
    },
    isAvailable: {
      type: Boolean,
      default: true,
      // Toggled by admin — triggers Redis cache invalidation
    },
    sortOrder: {
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
// Primary menu query: all available products for a store grouped by category
productSchema.index({ storeId: 1, categoryId: 1, isAvailable: 1, sortOrder: 1 });

// Admin product listing per store
productSchema.index({ storeId: 1, isAvailable: 1 });

// Customer search by name within a store
productSchema.index({ storeId: 1, name: 'text' }); // MongoDB text index for search

export default mongoose.model('Product', productSchema);