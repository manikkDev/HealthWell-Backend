const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const connectToDatabase = require('../../db');

const app = express();

// Middleware
app.use(express.json());

// CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Database connection middleware
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    console.error('Database connection failed:', error);
    res.status(500).json({ message: 'Database connection failed' });
  }
});

// Handle all methods for this endpoint
app.all('*', async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
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

module.exports = app;