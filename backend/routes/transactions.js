const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Transaction = require('../models/Transaction');

// @route   GET /api/transactions/:groupId
// @desc    Get all transactions for a group
// @access  Private
router.get('/:groupId', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ group: req.params.groupId })
      .sort({ date: -1 });
    
    const formattedTransactions = transactions.map(t => ({
      id: t._id,
      description: t.description,
      amount: t.amount,
      type: t.type,
      category: t.category,
      status: t.status,
      date: t.date,
      groupId: t.group
    }));

    res.json(formattedTransactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/transactions
// @desc    Create a new transaction
// @access  Private
router.post('/', [
  auth,
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('type').isIn(['income', 'expense']).withMessage('Invalid transaction type'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('groupId').notEmpty().withMessage('Group ID is required'),
], async (req, res) => {
  try {
    const { description, amount, type, category, status = 'completed', groupId } = req.body;

    // Create the transaction with minimum required fields
    const transaction = await Transaction.create({
      description,
      amount,
      type,
      category,
      status,
      group: groupId,
      payer: req.user._id, // Set current user as payer
      participants: [{ user: req.user._id, share: amount }] // Set single participant as current user
    });

    // Format response to match frontend expectations
    const formattedTransaction = {
      id: transaction._id,
      description: transaction.description,
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      status: transaction.status,
      date: transaction.date,
      groupId: transaction.group
    };

    res.status(201).json(formattedTransaction);
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/transactions/:id
// @desc    Update a transaction
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Update the allowed fields
    const { description, amount, type, category, status } = req.body;
    if (description) transaction.description = description;
    if (amount) {
      transaction.amount = amount;
      // Update the share amount for the payer
      const payerIndex = transaction.participants.findIndex(p => 
        p.user.toString() === transaction.payer.toString()
      );
      if (payerIndex !== -1) {
        transaction.participants[payerIndex].share = amount;
      }
    }
    if (type) transaction.type = type;
    if (category) transaction.category = category;
    if (status) transaction.status = status;

    await transaction.save();

    // Format response
    const formattedTransaction = {
      id: transaction._id,
      description: transaction.description,
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      status: transaction.status,
      date: transaction.date,
      groupId: transaction.group
    };

    res.json(formattedTransaction);
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/transactions/:id
// @desc    Delete a transaction
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    await transaction.remove();
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;