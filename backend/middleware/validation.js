const { validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      messages: errors.array().map(error => ({
        field: error.path || error.param,
        message: error.msg,
        value: error.value
      })),
      timestamp: new Date().toISOString()
    });
  }
  
  next();
};

// Custom validation for budget data
const validateBudgetData = (req, res, next) => {
  const { limit, startDate, endDate } = req.body;
  
  // Validate limit
  if (limit && (isNaN(limit) || parseFloat(limit) <= 0)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid Budget Limit',
      message: 'Budget limit must be a positive number',
      timestamp: new Date().toISOString()
    });
  }
  
  // Validate dates
  if (startDate && isNaN(Date.parse(startDate))) {
    return res.status(400).json({
      success: false,
      error: 'Invalid Start Date',
      message: 'Start date must be a valid date',
      timestamp: new Date().toISOString()
    });
  }
  
  if (endDate && isNaN(Date.parse(endDate))) {
    return res.status(400).json({
      success: false,
      error: 'Invalid End Date',
      message: 'End date must be a valid date',
      timestamp: new Date().toISOString()
    });
  }
  
  // Validate date range
  if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid Date Range',
      message: 'End date must be after start date',
      timestamp: new Date().toISOString()
    });
  }
  
  next();
};

// Custom validation for transaction data
const validateTransactionData = (req, res, next) => {
  const { amount, date, type } = req.body;
  
  // Validate amount
  if (amount && (isNaN(amount) || parseFloat(amount) <= 0)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid Amount',
      message: 'Transaction amount must be a positive number',
      timestamp: new Date().toISOString()
    });
  }
  
  // Validate date
  if (date && isNaN(Date.parse(date))) {
    return res.status(400).json({
      success: false,
      error: 'Invalid Date',
      message: 'Transaction date must be a valid date',
      timestamp: new Date().toISOString()
    });
  }
  
  // Validate type
  if (type && !['income', 'expense'].includes(type)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid Transaction Type',
      message: 'Transaction type must be either "income" or "expense"',
      timestamp: new Date().toISOString()
    });
  }
  
  next();
};

// Sanitize input data
const sanitizeInput = (req, res, next) => {
  // Sanitize string inputs
  const sanitizeString = (str) => {
    if (typeof str === 'string') {
      return str.trim().replace(/[<>]/g, '');
    }
    return str;
  };
  
  // Recursively sanitize object
  const sanitizeObject = (obj) => {
    if (obj && typeof obj === 'object') {
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          obj[key] = sanitizeString(obj[key]);
        } else if (typeof obj[key] === 'object') {
          sanitizeObject(obj[key]);
        }
      }
    }
  };
  
  sanitizeObject(req.body);
  next();
};

module.exports = {
  handleValidationErrors,
  validateBudgetData,
  validateTransactionData,
  sanitizeInput
};
