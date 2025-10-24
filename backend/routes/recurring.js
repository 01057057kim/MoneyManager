const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const {
  getRecurringTransactions,
  getRecurringTransaction,
  createRecurringTransaction,
  updateRecurringTransaction,
  deleteRecurringTransaction,
  executeRecurringTransaction,
  getDueRecurringTransactions
} = require('../controllers/recurringController');

// @route   GET /api/recurring
// @desc    Get all recurring transactions for a group
// @access  Private
router.get('/', auth, getRecurringTransactions);

// @route   GET /api/recurring/due
// @desc    Get due recurring transactions
// @access  Private
router.get('/due', auth, getDueRecurringTransactions);

// @route   POST /api/recurring
// @desc    Create a new recurring transaction
// @access  Private
// In your recurring routes file
router.post('/', [
  auth,
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('type').isIn(['income', 'expense']).withMessage('Invalid transaction type'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('group').notEmpty().withMessage('Group ID is required'),
  body('frequency').isIn(['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly']).withMessage('Invalid frequency'),
  body('startDate').isISO8601().withMessage('Start date must be a valid date'),
  body('payer').optional({ checkFalsy: true }).isMongoId().withMessage('Invalid payer ID'),
  body('client').optional({ checkFalsy: true }).isMongoId().withMessage('Invalid client ID'),
], createRecurringTransaction);

// @route   GET /api/recurring/:id
// @desc    Get a single recurring transaction
// @access  Private
router.get('/:id', auth, getRecurringTransaction);

// @route   PUT /api/recurring/:id
// @desc    Update a recurring transaction
// @access  Private
router.put('/:id', auth, updateRecurringTransaction);

// @route   DELETE /api/recurring/:id
// @desc    Delete a recurring transaction
// @access  Private
router.delete('/:id', auth, deleteRecurringTransaction);

// @route   POST /api/recurring/:id/execute
// @desc    Execute a recurring transaction manually
// @access  Private
router.post('/:id/execute', auth, executeRecurringTransaction);

module.exports = router;