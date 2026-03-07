const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: ['RESTOCK_REQUESTED', 'RESTOCK_APPROVED', 'QUANTITY_UPDATED', 'PRODUCT_ADDED', 'PRODUCT_DELETED']
  },
  details: {
    type: String,
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ActivityLog', activitySchema);
