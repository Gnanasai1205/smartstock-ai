const mongoose = require('mongoose');

const restockRequestSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  currentQuantity: {
    type: Number,
    required: true
  },
  suggestedQuantity: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  aiPredictionContext: {
    type: String, // String detailing what the AI algorithm predicted (e.g. Critical Stock)
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('RestockRequest', restockRequestSchema);
