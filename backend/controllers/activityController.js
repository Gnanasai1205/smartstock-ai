const ActivityLog = require('../models/ActivityLog');

// @route   GET /api/activity
// @desc    Get system wide activity logs
exports.getRecentActivity = async (req, res) => {
  try {
    const logs = await ActivityLog.find()
      .populate('product', 'name sku')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, data: logs });
  } catch (error) {
    console.error('Activity Log Fetch Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching activity logs' });
  }
};
