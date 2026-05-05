import mongoose from 'mongoose';

const tableSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },
    tableNumber: {
      type: Number,
      required: [true, 'Table number is required'],
      min: [1, 'Table number must be at least 1'],
    },
    // Full URL encoded in the QR code, e.g. https://app.com/menu/spicecraft?table=7
    qrCodeUrl: {
      type: String,
      required: true,
    },
    // Cloudinary or local URL of the generated QR image (PNG)
    qrImageUrl: {
      type: String,
      default: null,
    },
    isOccupied: {
      type: Boolean,
      default: false,
      // Updated in real-time via Socket.io when an active order exists
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// --- Indexes ---
tableSchema.index({ storeId: 1, tableNumber: 1 }, { unique: true }); // no duplicate table numbers per store
tableSchema.index({ storeId: 1, isOccupied: 1 });                    // admin tables grid: show occupied first
tableSchema.index({ storeId: 1, isActive: 1 });

export default mongoose.model('Table', tableSchema);