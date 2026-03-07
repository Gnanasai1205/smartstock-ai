const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// A simple JWT Secret for hackathon purposes
const JWT_SECRET = process.env.JWT_SECRET || 'smartstock_hackathon_super_secret_key_2026';

// @route   POST /api/auth/login
// @desc    Authenticate user & get token and role (Admin / Employee)
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.role === 'employee' && !user.isApproved) {
      return res.status(403).json({ success: false, message: 'Your account is pending Admin approval.' });
    }

    // Create Token
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({
          success: true,
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        });
      }
    );

  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @route   POST /api/auth/register
// @desc    Register a new employee pending admin approval
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashedPassword,
      role: 'employee',
      isApproved: false // Requires admin approval explicitly
    });

    await user.save();

    res.status(201).json({ 
      success: true, 
      message: 'Registration successful! Please wait for Admin approval to log in.' 
    });

  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

// @route   POST /api/auth/seed
// @desc    One-time route to generate dummy Admin and Employee accounts for testing
exports.seedUsers = async (req, res) => {
  try {
    // Check if users already exist
    const count = await User.countDocuments();
    if (count > 0) {
      return res.status(400).json({ success: false, message: 'Users already seeded. Database not empty.' });
    }

    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Create Admin User
    const adminUser = new User({
      name: 'System Admin',
      email: 'admin@smartstock.ai',
      password: hashedPassword,
      role: 'admin',
      isApproved: true
    });

    // Create Employee User
    const employeeUser = new User({
      name: 'John Doe (Staff)',
      email: 'employee@smartstock.ai',
      password: hashedPassword,
      role: 'employee',
      isApproved: true
    });

    await adminUser.save();
    await employeeUser.save();

    res.status(201).json({ 
      success: true, 
      message: 'Admin and Employee test accounts successfully created',
      credentials: {
        password: 'password123',
        admin: 'admin@smartstock.ai',
        employee: 'employee@smartstock.ai'
      }
    });

  } catch (error) {
    console.error('Seed error:', error.message);
    res.status(500).json({ success: false, message: 'Server error during seeding' });
  }
};
