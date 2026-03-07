const express = require('express');
const router = express.Router();
const { 
  getPendingStaff, 
  approveStaff, 
  approveRestockRequest,
  getPendingProducts,
  approveProduct,
  rejectProduct,
  getAllUsers,
  updateUserRole,
  deleteUser,
  exportInventoryCSV,
  bulkImportProducts,
  triggerCloudBackup
} = require('../controllers/adminController');

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.get('/pending-staff', getPendingStaff);
router.put('/approve-staff/:id', approveStaff);

router.put('/approve-restock/:id', approveRestockRequest);

router.get('/pending-products', getPendingProducts);
router.put('/approve-product/:id', approveProduct);
router.delete('/reject-product/:id', rejectProduct);

router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

router.get('/export-inventory', exportInventoryCSV);
router.post('/import-inventory', upload.single('file'), bulkImportProducts);
router.post('/trigger-backup', triggerCloudBackup);

module.exports = router;
