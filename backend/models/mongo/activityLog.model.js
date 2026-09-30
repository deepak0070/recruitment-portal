const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      index: true
    },
    performedBy: {
      id: { type: Number, required: true },
      name: { type: String, required: true },
      role: { type: String, required: true }
    },
    targetType: {
      type: String,
      required: true,
      enum: ['job', 'application', 'user', 'system'],
      index: true
    },
    targetId: {
      type: String,
      required: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

activityLogSchema.index({ createdAt: -1 });

const ActivityLog = mongoose.models.ActivityLog || mongoose.model('ActivityLog', activityLogSchema, 'activity_logs');

module.exports = ActivityLog;
