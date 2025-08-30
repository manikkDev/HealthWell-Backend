const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectToDatabase = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Configure CORS to allow requests from your frontend's origin
app.use(cors({
  origin: 'https://healthwell-frontend.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Routes
app.use('/api/auth', require('./routes/auth'));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'HealthWell Backend API' });
});

// Connect to MongoDB and then start the server
// This connection will be reused across invocations in a serverless environment
connectToDatabase()
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit process if DB connection fails
  });

// Global unhandled exception handler
process.on('uncaughtException', err => {
  console.error('There was an uncaught error:', err);
  process.exit(1); // mandatory (as per the Node.js docs)
});

module.exports = app;