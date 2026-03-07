const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name cannot be empty'],
    trim: true,
  },
  sku: {
    type: String,
    unique: true,
    sparse: true,
  },
  category: {
    type: String,
    default: 'General'
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be positive']
  },
  costPrice: {
    type: Number,
    min: [0, 'Cost Price must be positive']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative']
  },
  lowStockThreshold: {
    type: Number,
    default: 10
  },
  lastRestocked: {
    type: Date,
    default: Date.now
  },
  supplier: {
    name: String,
    contact: String,
    location: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  }
});

// Ensure clean error handling behavior by transforming validation errors if needed,
// though standard Mongoose validation messages are already configured above.
productSchema.post('save', function(error, doc, next) {
  if (error.name === 'ValidationError') {
    // We could format the errors here if we wanted to globally, 
    // but the custom messages above will be passed down to the controller block.
    next(error);
  } else {
    next(error);
  }
});

module.exports = mongoose.model('Product', productSchema);
