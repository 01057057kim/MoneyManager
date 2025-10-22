const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(rateLimiter);

// Request parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/budgets', require('./routes/budgets'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/recurring', require('./routes/recurring'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    time: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    name: 'Money Manager API',
    version: '1.0.0',
    documentation: '/api/docs'
  });
});

// Global error handler
app.use(errorHandler);

// Handle 404s
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});
