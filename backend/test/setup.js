// Test setup for backend
const mongoose = require('mongoose');

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/money_test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.PORT = '5001';

// Mock console methods to reduce noise during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Setup test database
beforeAll(async () => {
  try {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
  } catch (error) {
    console.error('Test database connection failed:', error);
    // Continue with tests even if database connection fails
  }
});

// Clean up after each test
afterEach(async () => {
  try {
    // Clear all collections
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  } catch (error) {
    console.error('Test cleanup failed:', error);
  }
});

// Close database connection after all tests
afterAll(async () => {
  try {
    await mongoose.connection.close();
  } catch (error) {
    console.error('Test database close failed:', error);
  }
});
