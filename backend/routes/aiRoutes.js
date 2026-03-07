const express = require('express');
const router = express.Router();
const insightController = require('../controllers/insightController');

// Define API routes for AI insights
router.get('/insights', insightController.getInsights);
router.get('/predictions', insightController.getPredictions);
router.get('/restock', insightController.getRestockRecommendations);
router.post('/chat', insightController.chatAssistant);

module.exports = router;
