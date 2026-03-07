const RestockRequest = require('../models/RestockRequest');
const Feedback = require('../models/Feedback');
const ActivityLog = require('../models/ActivityLog');
const Product = require('../models/Product');
const { generateStructuredJSON } = require('../services/groqService');

// @route   POST /api/employee/restock
// @desc    Submit a smart restock request to admin
exports.createRestockRequest = async (req, res) => {
  try {
    const { productId, requestedBy, currentQuantity } = req.body;

    // Validate
    if (!productId || !requestedBy) {
      return res.status(400).json({ success: false, message: 'Missing required restock fields' });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    // Feature 9: AI Smart Restock Requests
    const schema = {
      type: "object",
      properties: {
        suggestedQuantity: { 
          type: "integer",
          description: "An exact numeric amount needed to restore healthy margins (usually 10-30 units)."
        },
        aiPredictionContext: {
          type: "string",
          description: "A short, 1-sentence reasoning explaining why this amount was selected."
        }
      },
      required: ["suggestedQuantity", "aiPredictionContext"]
    };

    const aiResult = await generateStructuredJSON(
      "You are an AI inventory module assessing a staff order. Generate an intelligent restock quantity.",
      `Product: ${product.name}\nCurrent Quantity: ${currentQuantity}\nThreshold: ${product.lowStockThreshold || 10}`,
      schema
    );

    const request = new RestockRequest({
      product: productId,
      requestedBy,
      currentQuantity,
      suggestedQuantity: aiResult.suggestedQuantity,
      aiPredictionContext: aiResult.aiPredictionContext
    });

    await request.save();
    
    // Log Activity
    await ActivityLog.create({
      action: 'RESTOCK_REQUESTED',
      details: `Restock requested: +${aiResult.suggestedQuantity} units`,
      product: productId,
      user: requestedBy
    });

    // In a real app we would populate this, but we'll return the raw object for now
    res.status(201).json({ success: true, data: request });
  } catch (error) {
    console.error('Restock Request Error:', error);
    res.status(500).json({ success: false, message: 'Server error processing request' });
  }
};

// @route   GET /api/employee/restocks
// @desc    Get all pending restock requests (Admin view)
exports.getRestockRequests = async (req, res) => {
  try {
    const requests = await RestockRequest.find()
      .populate('product', 'name sku price')
      .populate('requestedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: requests });
  } catch (error) {
    
    console.error('Get Restocks Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching requests' });
  }
};

// @route   GET /api/employee/my-restocks/:userId
// @desc    Get all restock requests for a specific employee
exports.getMyRestockRequests = async (req, res) => {
  try {
    const requests = await RestockRequest.find({ requestedBy: req.params.userId })
      .populate('product', 'name category')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: requests });
  } catch (error) {
    console.error('Get My Restocks Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching user requests' });
  }
};

// @route   POST /api/employee/feedback
// @desc    Submit issue feedback to admin
exports.submitFeedback = async (req, res) => {
  try {
    const { reportedBy, productId, subject, message } = req.body;

    if (!reportedBy || !subject || !message) {
      return res.status(400).json({ success: false, message: 'Missing required feedback fields' });
    }

    const feedback = new Feedback({
      reportedBy,
      product: productId || null,
      subject,
      message
    });

    await feedback.save();
    res.status(201).json({ success: true, data: feedback });
  } catch (error) {
    console.error('Feedback Error:', error);
    res.status(500).json({ success: false, message: 'Server error processing feedback' });
  }
};

// @route   GET /api/employee/feedback
// @desc    Get all feedback tickets
exports.getFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find()
      .populate('product', 'name sku')
      .populate('reportedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: feedback });
  } catch (error) {
    console.error('Get Feedback Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching feedback' });
  }
};

// @route   POST /api/employee/request-product
// @desc    Staff requests to add a new product to the catalog (requires admin approval)
exports.requestProduct = async (req, res) => {
  try {
    const { 
      name, sku, category, description, price, costPrice, 
      quantity, lowStockThreshold, supplier, requestedBy
    } = req.body;
    
    // Auto-generate SKU if omitted
    const generatedSku = sku || `SKU-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 100)}`;

    const newProduct = new Product({ 
      name, 
      sku: generatedSku,
      category, 
      description, 
      price, 
      costPrice, 
      quantity,
      lowStockThreshold,
      supplier,
      status: 'pending' // Force staff requests into pending queue
    });
    
    const savedProduct = await newProduct.save();
    
    // Log Activity
    await ActivityLog.create({
      action: 'PRODUCT_ADDED',
      details: `Staff proposed new product: ${savedProduct.name} (${savedProduct.sku})`,
      product: savedProduct._id,
      user: requestedBy
    });

    res.status(201).json({ success: true, data: savedProduct });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, error: 'Validation Error', messages });
    }
    console.error('Request Product Error:', error);
    res.status(500).json({ success: false, message: 'Server error requesting product' });
  }
};
