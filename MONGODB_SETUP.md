# MongoDB Setup Guide

This guide will help you set up MongoDB for the HealthWell backend.

## Quick Start with MongoDB Atlas (Recommended)

MongoDB Atlas is a cloud-hosted MongoDB service with a free tier perfect for development.

### Steps:
1. **Sign up**: Go to [MongoDB Atlas](https://www.mongodb.com/atlas) and create a free account
2. **Create Cluster**: 
   - Click "Build a Database"
   - Choose "FREE" shared cluster
   - Select a cloud provider and region
   - Click "Create Cluster"
3. **Create Database User**:
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Set username: `healthwell-user`
   - Generate a secure password (save it!)
   - Set privileges to "Read and write to any database"
   - Click "Add User"
4. **Configure Network Access**:
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Click "Confirm"
5. **Get Connection String**:
   - Go back to "Clusters"
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Select "Node.js" and version "4.1 or later"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `healthwell`

### Example connection string:
```
mongodb+srv://healthwell-user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/healthwell?retryWrites=true&w=majority
```

## Alternative: Local MongoDB Installation

### Windows:
1. Download [MongoDB Community Server](https://www.mongodb.com/try/download/community)
2. Run installer with default settings
3. MongoDB runs as a Windows service automatically
4. Connection string: `mongodb://localhost:27017/healthwell`

### macOS (using Homebrew):
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community
```

### Linux (Ubuntu/Debian):
```bash
# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

## Configuration

Update your `.env` file in the backend directory:

```env
# Replace with your actual MongoDB connection string
MONGODB_URI=mongodb+srv://healthwell-user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/healthwell?retryWrites=true&w=majority

# Or for local MongoDB:
# MONGODB_URI=mongodb://localhost:27017/healthwell
```

## Testing the Connection

1. Save your `.env` file with the correct connection string
2. Restart the backend server (it should restart automatically with nodemon)
3. Look for "MongoDB connected successfully" in the console
4. If you see connection errors, double-check:
   - Username and password are correct
   - Network access is configured to allow your IP
   - Connection string format is correct

## Troubleshooting

- **Connection timeout**: Check network access settings in Atlas
- **Authentication failed**: Verify username/password in connection string
- **Database not found**: MongoDB will create the database automatically when first accessed
- **IP not whitelisted**: Add your current IP address to Network Access in Atlas