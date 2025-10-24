const mongoose = require('mongoose');

const connectWithRetry = async (retries = 5) => {
  try {
    const options = {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority',
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 5, // Maintain a minimum of 5 socket connections
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      bufferCommands: false // Disable mongoose buffering
    };

    const conn = await mongoose.connect(process.env.MONGO_URI, options);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🔗 Connection State: ${conn.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    
    return conn;
  } catch (error) {
    if (retries === 0) {
      console.error('❌ Failed to connect to MongoDB after multiple attempts:', error.message);
      console.error('🔧 Please check your MongoDB connection string and ensure:');
      console.error('   1. Your IP address is whitelisted in MongoDB Atlas');
      console.error('   2. Your username and password are correct');
      console.error('   3. The cluster is up and running');
      console.error('   4. Network connectivity is available');
      process.exit(1);
    }
    console.log(`⏳ MongoDB connection attempt failed. Retrying in 5 seconds... (${retries} attempts left)`);
    await new Promise(resolve => setTimeout(resolve, 5000));
    return connectWithRetry(retries - 1);
  }
};

const connectDB = async () => {
  try {
    const conn = await connectWithRetry();

    // Connection event handlers
    mongoose.connection.on('error', (err) => {
      console.error('🚨 MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
      connectWithRetry();
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected successfully');
    });

    mongoose.connection.on('close', () => {
      console.log('🔌 MongoDB connection closed');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔌 MongoDB connection closed through app termination');
      process.exit(0);
    });

    return conn;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
