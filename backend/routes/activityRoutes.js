const express = require('express');
const router = express.Router();
const { getRecentActivity } = require('../controllers/activityController');

// Get recent activity logs
router.get('/', getRecentActivity);

module.exports = router;
