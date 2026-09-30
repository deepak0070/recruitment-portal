const ActivityLog = require('../models/mongo/activityLog.model');
const mongoose = require('mongoose');

const localDb = require('../config/localDb');

class ActivityService {
  /**
   * Log an activity event to MongoDB (or localDb when MongoDB is offline)
   */
  static async log({ action, performedBy, targetType, targetId, metadata = {} }) {
    try {
      if (mongoose.connection.readyState !== 1) {
        return localDb.logActivity({ action, performedBy, targetType, targetId, metadata });
      }

      const logEntry = await ActivityLog.create({
        action,
        performedBy: {
          id: performedBy.id,
          name: performedBy.name,
          role: performedBy.role
        },
        targetType,
        targetId: String(targetId),
        metadata
      });

      return logEntry;
    } catch (error) {
      console.warn(`[ActivityService] Error creating activity log: ${error.message}`);
      return null;
    }
  }

  /**
   * Get recent activity logs with pagination
   * @param {number} limit
   * @param {number} skip
   */
  static async getRecentLogs(limit = 20, skip = 0) {
    try {
      if (mongoose.connection.readyState !== 1) {
        return localDb.getRecentActivity(limit);
      }
      return await ActivityLog.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
    } catch (error) {
      console.warn(`[ActivityService] Error fetching activity logs: ${error.message}`);
      return [];
    }
  }
}

module.exports = ActivityService;
