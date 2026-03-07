const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Define API routes for products
router.get('/', productController.getProducts);
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProductQuantity);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
