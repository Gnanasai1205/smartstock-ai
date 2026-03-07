const Product = require('../models/Product');
const ActivityLog = require('../models/ActivityLog');

// Get all products (with optional lowStock filter)
exports.getProducts = async (req, res) => {
  try {
    const { lowStock } = req.query;
    let query = { status: 'approved' }; // Only fetch approved products for the main catalog

    if (lowStock === 'true') {
      query.quantity = { $lt: 10 };
    }

    const products = await Product.find(query);
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add a new product
exports.createProduct = async (req, res) => {
  try {
    const { 
      name, sku, category, description, price, costPrice, 
      quantity, lowStockThreshold, supplier 
    } = req.body;
    
    // Auto-generate SKU if omitted for fast uploads
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
      supplier
    });
    const savedProduct = await newProduct.save();
    
    // Log Activity (Defaulting to "System" or an Admin logic if mapped later)
    await ActivityLog.create({
      action: 'PRODUCT_ADDED',
      details: `Added new product: ${savedProduct.name} (${savedProduct.sku})`,
      product: savedProduct._id
    });

    res.status(201).json({ success: true, data: savedProduct });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, error: 'Validation Error', messages });
    }
    res.status(500).json({ success: false, error: 'Server Error', message: error.message });
  }
};

// Update product quantity
exports.updateProductQuantity = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined || quantity < 0) {
      return res.status(400).json({ success: false, message: "Quantity is required and cannot be negative" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { quantity },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Log Activity
    await ActivityLog.create({
      action: 'QUANTITY_UPDATED',
      details: `Updated inventory for ${updatedProduct.name} to ${quantity} units`,
      product: updatedProduct._id
    });

    res.json({ success: true, data: updatedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Log Activity
    await ActivityLog.create({
      action: 'PRODUCT_DELETED',
      details: `Deleted product: ${deletedProduct.name}`,
    });

    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
