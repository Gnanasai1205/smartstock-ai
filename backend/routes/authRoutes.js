const express = require('express');
const router = express.Router();
const { loginUser, registerUser, seedUsers } = require('../controllers/authController');

// Define Auth API endpoints
router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/seed', seedUsers);

module.exports = router;
