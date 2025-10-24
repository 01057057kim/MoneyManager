const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction
} = require('../controllers/transactionController');

// @route   GET /api/transactions/:groupId
// @desc    Get all transactions for a group
// @access  Private
router.get('/:groupId', auth, getTransactions);

// @route   POST /api/transactions
// @desc    Create a new transaction
// @access  Private
router.post('/', [
  auth,
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('type').isIn(['income', 'expense']).withMessage('Invalid transaction type'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('status').optional().isIn(['pending', 'completed', 'cancelled']).withMessage('Invalid status'),
  body('groupId').notEmpty().withMessage('Group ID is required'),
  body('payer').optional().isMongoId().withMessage('Invalid payer ID'),
], createTransaction);

// @route   PUT /api/transactions/:id
// @desc    Update a transaction
// @access  Private
router.put('/:id', auth, updateTransaction);

// @route   DELETE /api/transactions/:id
// @desc    Delete a transaction
// @access  Private
router.delete('/:id', auth, deleteTransaction);

module.exports = router;