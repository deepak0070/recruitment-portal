const ActivityLog = require('../models/mongo/activityLog.model');
const mongoose = require('mongoose');

class ActivityService {
  /**
   * Log an activity event to MongoDB
   * @param {Object} params
   * @param {string} params.action
   * @param {Object} params.performedBy - { id, name, role }
   * @param {string} params.targetType - 'job' | 'application' | 'user' | 'system'
   * @param {string|number} params.targetId
   * @param {Object} [params.metadata]
   */
  static async log({ action, performedBy, targetType, targetId, metadata = {} }) {
    try {
      if (mongoose.connection.readyState !== 1) {
        console.warn(`[ActivityService] MongoDB not ready (state: ${mongoose.connection.readyState}). Skipping log: ${action}`);
        return null;
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
        return [];
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
