const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', async (req, res) => {
  try {
    const { firstName, lastName, email, username, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ message: 'Email already exists' });
      }
      if (existingUser.username === username) {
        return res.status(400).json({ message: 'Username already exists' });
      }
    }

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      username,
      password
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user
    });
  } catch (error) {
    console.error('Signup error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      timestamp: new Date().toISOString()
    });
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: errors[0] });
    }
    
    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({ message: `${field} already exists` });
    }
    
    res.status(500).json({ message: 'Server error during signup' });
  }
});

// @route   POST /api/auth/signin
// @desc    Authenticate user and get token
// @access  Public
router.post('/signin', async (req, res) => {
  console.log('Signin attempt received.');
  console.log('Request body:', req.body);
  console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
  
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      console.log('Missing email or password in request');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    console.log(`Attempting to sign in with email/username: ${email}`);

    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email }, { username: email }]
    });
    if (!user) {
      console.log('User not found for provided credentials.');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('User found, checking password...');
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Password mismatch for user.');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('Password verified, generating token...');
    
    // Check if JWT_SECRET exists
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('Token generated successfully, sending response...');
    
    res.json({
      message: 'Login successful',
      token,
      user
    });
  } catch (error) {
    console.error('Signin error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({ message: 'Server error during signin' });
    console.log('Signin process completed with error.');
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const { firstName, lastName, email, username } = req.body;
    const userId = req.user.userId;

    // Check if email or username already exists (excluding current user)
    const existingUser = await User.findOne({
      $and: [
        { _id: { $ne: userId } },
        { $or: [{ email }, { username }] }
      ]
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ message: 'Email already exists' });
      }
      if (existingUser.username === username) {
        return res.status(400).json({ message: 'Username already exists' });
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, email, username },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Profile update error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: errors[0] });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;