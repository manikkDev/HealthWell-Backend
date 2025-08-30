const mongoose = require('mongoose');

let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    console.log('Using cached database connection');
    return cachedDb;
  }

  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('MongoDB URI exists:', !!process.env.MONGODB_URI);
    
    const db = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthwell', {
      bufferCommands: false, // Disable mongoose buffering
      serverSelectionTimeoutMS: 30000, // Keep trying to send operations for 30 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });

    console.log('MongoDB connection established successfully');
    cachedDb = db;
    return db;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', {
      message: error.message,
      code: error.code,
      name: error.name
    });
    throw error;
  }
}

module.exports = connectToDatabase;