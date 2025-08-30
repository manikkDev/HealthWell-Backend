const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectToDatabase = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.originalUrl}`);
  next();
});

// Configure CORS to allow requests from your frontend's origin
app.use(cors({
  origin: 'https://healthwell-frontend.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Connect to MongoDB and then set up routes
connectToDatabase()
  .then(() => {
    console.log('MongoDB connected successfully');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('VERCEL:', process.env.VERCEL);
  })
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

// If not in Vercel environment, start the server




// Global unhandled exception handler
process.on('uncaughtException', err => {
  console.error('There was an uncaught error:', err);
  process.exit(1); // mandatory (as per the Node.js docs)
});

module.exports = app;