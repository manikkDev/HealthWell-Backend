const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectToDatabase = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Configure CORS to allow requests from frontend origins
app.use(cors({
  origin: [
    'https://healthwell-frontend.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.originalUrl}`);
  next();
});

// Initialize database connection
let dbConnected = false;

async function initializeDatabase() {
  if (!dbConnected) {
    try {
      await connectToDatabase();
      console.log('MongoDB connected successfully');
      console.log('NODE_ENV:', process.env.NODE_ENV);
      console.log('VERCEL:', process.env.VERCEL);
      dbConnected = true;
    } catch (err) {
      console.error('MongoDB connection error:', err);
      console.error('Error details:', err.message, err.stack);
      throw err;
    }
  }
}

// For Vercel serverless functions, we need to initialize DB on each request
app.use(async (req, res, next) => {
  try {
    await initializeDatabase();
    next();
  } catch (error) {
    console.error('Database initialization failed:', error);
    res.status(500).json({ message: 'Database connection failed' });
  }
});

// Start server only if not in Vercel environment
if (!process.env.VERCEL) {
  initializeDatabase()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch(err => {
      console.error('Failed to start server:', err);
      process.exit(1);
    });
}

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'HealthWell Backend API' });
  console.log('Root route accessed.');
});

// Handle OPTIONS requests for CORS preflight
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    return res.sendStatus(200);
  }
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));

// Catch-all handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global unhandled exception handler
process.on('uncaughtException', err => {
  console.error('There was an uncaught error:', err);
  process.exit(1); // mandatory (as per the Node.js docs)
});

module.exports = app;