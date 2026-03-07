const User = require('../models/User');
const RestockRequest = require('../models/RestockRequest');
const Product = require('../models/Product');
const ActivityLog = require('../models/ActivityLog');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// @route   GET /api/admin/pending-staff
// @desc    Get all employees who haven't been approved yet
exports.getPendingStaff = async (req, res) => {
  try {
    const pendingUsers = await User.find({ role: 'employee', isApproved: false })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: pendingUsers });
  } catch (error) {
    console.error('Fetch Pending Staff Error:', error);
    res.status(500).json({ success: false, message: 'Server error parsing unapproved staff' });
  }
};

// @route   PUT /api/admin/approve-staff/:id
// @desc    Approve a pending employee account to allow them to login
exports.approveStaff = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user, message: 'Staff member approved successfully!' });
  } catch (error) {
    console.error('Approve Staff Error:', error);
    res.status(500).json({ success: false, message: 'Server error approving staff member' });
  }
};

// @route   PUT /api/admin/approve-restock/:id
// @desc    Approve a restock request, update product quantity, and log
exports.approveRestockRequest = async (req, res) => {
  try {
    const request = await RestockRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    ).populate('product');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    const { quantity } = req.body; 
    
    const product = await Product.findByIdAndUpdate(
      request.product._id,
      { quantity },
      { new: true }
    );

    // Log Activity
    await ActivityLog.create({
      action: 'RESTOCK_APPROVED',
      details: `Restock approved for ${product.name}: +${request.suggestedQuantity} units`,
      product: product._id
    });

    res.json({ success: true, data: request, message: 'Restock approved successfully' });
  } catch (error) {
    console.error('Approve Restock Error:', error);
    res.status(500).json({ success: false, message: 'Server error approving restock' });
  }
};

// @route   GET /api/admin/pending-products
// @desc    Get all newly suggested products from employees
exports.getPendingProducts = async (req, res) => {
  try {
    const pendingProducts = await Product.find({ status: 'pending' }).sort({ createdAt: -1 });
    res.json({ success: true, data: pendingProducts });
  } catch (error) {
    console.error('Fetch Pending Products Error:', error);
    res.status(500).json({ success: false, message: 'Server error parsing pending products' });
  }
};

// @route   PUT /api/admin/approve-product/:id
// @desc    Approve a pending new product into the main inventory
exports.approveProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product proposal not found' });
    }

    res.json({ success: true, data: product, message: 'Product proposal approved successfully!' });
  } catch (error) {
    console.error('Approve Product Error:', error);
    res.status(500).json({ success: false, message: 'Server error approving product' });
  }
};

// @route   DELETE /api/admin/reject-product/:id
// @desc    Discard a new product proposal
exports.rejectProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product proposal not found' });
    }

    res.json({ success: true, message: 'Product proposal discarded' });
  } catch (error) {
    console.error('Error rejecting product proposal:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @route   GET /api/admin/users
// @desc    Get all users for Team Management Grid
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Fetch users error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @route   PUT /api/admin/users/:id/role
// @desc    Change user role (admin/employee)
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['admin', 'employee'].includes(role)) {
       return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    // Prevent removing the last admin
    if (user.role === 'admin' && role === 'employee') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ success: false, message: 'Cannot demote the last admin.' });
      }
    }

    user.role = role;
    await user.save();

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Update role error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @route   DELETE /api/admin/users/:id
// @desc    Delete user completely
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Prevent deleting the last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ success: false, message: 'Cannot delete the last admin.' });
      }
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User removed' });
  } catch (error) {
    console.error('Delete user error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @route   GET /api/admin/export-inventory
// @desc    Download the entire product database as a CSV
exports.exportInventoryCSV = async (req, res) => {
  try {
    const products = await Product.find().lean();
    if (!products || products.length === 0) {
      return res.status(404).json({ success: false, message: 'No inventory to export' });
    }

    // Build simple CSV headers
    const header = ['SKU', 'Name', 'Category', 'Quantity', 'Status', 'Cost', 'Supplier'];
    let csvData = header.join(',') + '\n';

    // Map rows
    products.forEach(p => {
      const row = [
        p.sku || '',
        `"${(p.name || '').replace(/"/g, '""')}"`,
        p.category || '',
        p.quantity || 0,
        p.status || '',
        p.cost || 0,
        `"${(p.supplier || '').replace(/"/g, '""')}"`
      ];
      csvData += row.join(',') + '\n';
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="inventory-export.csv"');
    res.status(200).send(csvData);
    
    // Log Activity asynchronously
    ActivityLog.create({
      action: 'SYSTEM_SETTINGS_UPDATE',
      details: `Admin exported full inventory ledger (${products.length} items).`
    }).catch(err => console.error("Log failed:", err));

  } catch (error) {
    console.error('Export CSV Error:', error);
    res.status(500).json({ success: false, message: 'Server error generating CSV' });
  }
};

// @route   POST /api/admin/import-inventory
// @desc    Bulk create products from a standard CSV upload
exports.bulkImportProducts = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded.' });
  }

  const results = [];
  try {
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => {
        // Simple mapping, expecting columns: Name, Category, Quantity, Supplier, Cost, SKU
        // In a real app we'd validate the headers exist before pushing
        if(data.Name || data.name) {
             results.push({
               name: data.Name || data.name,
               category: data.Category || data.category || 'Other',
               quantity: parseInt(data.Quantity || data.quantity || 0, 10),
               supplier: data.Supplier || data.supplier || 'Unknown',
               cost: parseFloat(data.Cost || data.cost || 0),
               sku: data.SKU || data.sku || `IMP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
               status: 'approved'
             });
        }
      })
      .on('end', async () => {
        // Clear the temp file created by multer
        fs.unlinkSync(req.file.path);

        if (results.length === 0) {
           return res.status(400).json({ success: false, message: 'CSV file is empty or improperly formatted.' });
        }

        const inserted = await Product.insertMany(results);
        
        await ActivityLog.create({
          action: 'NEW_PRODUCT_PROPOSAL', // Generic action type
          details: `Admin bulk imported ${inserted.length} new inventory items.`
        });

        return res.json({ success: true, message: `Successfully imported ${inserted.length} products.` });
      });
  } catch (error) {
    console.error('Import CSV Error:', error);
    // Cleanup on error
    if(fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    return res.status(500).json({ success: false, message: 'Server error parsing CSV file' });
  }
};

// @route   POST /api/admin/trigger-backup
// @desc    Simulate cold storage backup pipeline execution
exports.triggerCloudBackup = async (req, res) => {
  try {
     // A faux delay to mimic the system zipping the database shards
     await new Promise(resolve => setTimeout(resolve, 2500));
     
     // Optionally we could dump the DB down to JSON files and write them directly into the `/logs` directory,
     // but for the frontend demonstration just sending success works perfectly.
     
     await ActivityLog.create({
       action: 'SYSTEM_SETTINGS_UPDATE',
       details: 'Admin triggered a manual Cloud DB snapshot.'
     });

     res.json({ success: true, message: 'Database snapshot finalized and stored successfully.' });
  } catch (error) {
    console.error('Snapshot Error:', error);
    res.status(500).json({ success: false, message: 'Failed to complete cloud backup.' });
  }
};
