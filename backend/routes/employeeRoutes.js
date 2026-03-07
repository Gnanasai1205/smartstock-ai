const express = require('express');
const router = express.Router();
const { 
  createRestockRequest, 
  getRestockRequests, 
  getMyRestockRequests,
  submitFeedback, 
  getFeedback,
  requestProduct
} = require('../controllers/employeeController');

// Employee Actions
router.post('/restock', createRestockRequest);
router.get('/my-restocks/:userId', getMyRestockRequests);
router.post('/feedback', submitFeedback);
router.post('/product', requestProduct);

// Admin Observables
router.get('/restocks', getRestockRequests);
router.get('/feedback', getFeedback);

module.exports = router;
