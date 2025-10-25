const rateLimit = require('express-rate-limit');

// General API rate limiter - More generous for dashboard usage
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 10000 : 1000, // Much higher limit in development
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks and in development for localhost
    if (req.path === '/api/health') return true;
    if (process.env.NODE_ENV === 'development' && req.ip === '::1') return true;
    if (process.env.NODE_ENV === 'development' && req.ip === '127.0.0.1') return true;
    return false;
  }
});

// Strict rate limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth requests per windowMs
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Upload rate limiter
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 uploads per minute
  message: {
    success: false,
    error: 'Too many upload attempts, please try again later',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false
});

// CRUD operations rate limiter - More generous for dashboard operations
const crudLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200, // Limit each IP to 200 CRUD operations per minute
  message: {
    success: false,
    error: 'Too many operations, please slow down',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Development bypass - No rate limiting in development
const devBypass = (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    return next();
  }
  return generalLimiter(req, res, next);
};

module.exports = {
  general: process.env.NODE_ENV === 'development' ? devBypass : generalLimiter,
  auth: authLimiter,
  upload: uploadLimiter,
  crud: crudLimiter
};