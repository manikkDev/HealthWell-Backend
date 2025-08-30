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

// Connect to MongoDB and then set up routes
connectToDatabase()
  .then(() => {
    console.log('MongoDB connected successfully');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('VERCEL:', process.env.VERCEL);
    
    // Start server only if not in Vercel environment
    if (!process.env.VERCEL) {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    console.error('Error details:', err.message, err.stack);
    process.exit(1); // Exit process if DB connection fails
  });

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'HealthWell Backend API' });
  console.log('Root route accessed.');
});

// Routes
app.use('/api/auth', require('./routes/auth'));

// Global unhandled exception handler
process.on('uncaughtException', err => {
  console.error('There was an uncaught error:', err);
  process.exit(1); // mandatory (as per the Node.js docs)
});

module.exports = app;