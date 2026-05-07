import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Could be system-generated
  },
  action: {
    type: String,
    required: true,
    index: true,
  },
  entityType: {
    type: String,
    required: true,
    index: true,
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
  },
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }, // Only need creation time
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
