const mongoose = require('mongoose');

const connectWithRetry = async (retries = 5) => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority'
    });

    console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    if (retries === 0) {
      console.error('Failed to connect to MongoDB Atlas after multiple attempts:', error.message);
      console.error('Please check your MongoDB Atlas connection string and ensure:');
      console.error('1. Your IP address is whitelisted in MongoDB Atlas');
      console.error('2. Your username and password are correct');
      console.error('3. The cluster is up and running');
      process.exit(1);
    }
    console.log(`MongoDB connection attempt failed. Retrying... (${retries} attempts left)`);
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
    return connectWithRetry(retries - 1);
  }
};

const connectDB = async () => {
  const conn = await connectWithRetry();

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected. Attempting to reconnect...');
    connectWithRetry();
  });

  return conn;
};

module.exports = connectDB;
