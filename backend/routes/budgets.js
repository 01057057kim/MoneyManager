const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const { handleValidationErrors, validateBudgetData, sanitizeInput } = require('../middleware/validation');
const {
  getBudgets,
  getBudget,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetAnalytics
} = require('../controllers/budgetController');

// @route   GET /api/budgets
// @desc    Get all budgets for a group
// @access  Private
router.get('/', auth, getBudgets);

// @route   POST /api/budgets
// @desc    Create a new budget
// @access  Private
router.post('/', [
  auth,
  sanitizeInput,
  body('name').trim().notEmpty().withMessage('Budget name is required').isLength({ min: 1, max: 100 }).withMessage('Budget name must be between 1 and 100 characters'),
  body('group').notEmpty().withMessage('Group ID is required').isMongoId().withMessage('Invalid group ID'),
  body('category').trim().notEmpty().withMessage('Category is required').isLength({ min: 1, max: 50 }).withMessage('Category must be between 1 and 50 characters'),
  body('limit').isNumeric().withMessage('Limit must be a number').isFloat({ min: 0.01 }).withMessage('Limit must be greater than 0'),
  body('period').isIn(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']).withMessage('Invalid period'),
  body('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
  body('endDate').optional().isISO8601().withMessage('End date must be a valid date'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters'),
  validateBudgetData,
  handleValidationErrors
], createBudget);

// @route   GET /api/budgets/:id
// @desc    Get a single budget
// @access  Private
router.get('/:id', auth, getBudget);

// @route   GET /api/budgets/:id/analytics
// @desc    Get budget analytics
// @access  Private
router.get('/:id/analytics', auth, getBudgetAnalytics);

// @route   PUT /api/budgets/:id
// @desc    Update a budget
// @access  Private
router.put('/:id', auth, updateBudget);

// @route   DELETE /api/budgets/:id
// @desc    Delete a budget
// @access  Private
router.delete('/:id', auth, deleteBudget);

module.exports = router;