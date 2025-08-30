const mongoose = require('mongoose');

let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  const db = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthwell', {
    bufferCommands: false, // Disable mongoose buffering
    serverSelectionTimeoutMS: 30000, // Keep trying to send operations for 30 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  });

  cachedDb = db;
  return db;
}

module.exports = connectToDatabase;