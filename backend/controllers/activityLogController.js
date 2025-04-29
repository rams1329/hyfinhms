// backend/controllers/activityLogController.js
import ActivityLog from "../models/activityLogModel.js";
import User from "../models/userModel.js";

// Get all activity logs with pagination
export const getActivityLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, action, userId, startDate, endDate } = req.query;
    
    // Build filter object
    const filter = {};
    if (action) filter.action = action;
    if (userId) filter.userId = userId;
    
    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    
    // Get total count for pagination
    const total = await ActivityLog.countDocuments(filter);
    
    // Get logs with pagination and populate user info
    const logs = await ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();
    
    res.json({
      success: true,
      logs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    res.json({
      success: false,
      message: error.message
    });
  }
};

// Create a new activity log
export const createActivityLog = async (req, res) => {
  try {
    const { userId, action, details } = req.body;
    
    // Get user name
    const user = await User.findById(userId);
    if (!user) {
      return res.json({
        success: false,
        message: "User not found"
      });
    }
    
    const log = new ActivityLog({
      userId,
      userName: user.name,
      action,
      details,
      ipAddress: req.ip
    });
    
    await log.save();
    
    res.json({
      success: true,
      message: "Activity logged successfully",
      log
    });
  } catch (error) {
    console.error("Error logging activity:", error);
    res.json({
      success: false,
      message: error.message
    });
  }
};

// Utility function to log activity (for internal use)
export const logActivity = async (userId, action, details = {}) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;
    
    const log = new ActivityLog({
      userId,
      userName: user.name,
      action,
      details
    });
    
    await log.save();
    return log;
  } catch (error) {
    console.error("Error logging activity:", error);
  }
};
