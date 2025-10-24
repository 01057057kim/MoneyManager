const { validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');
const Group = require('../models/Group');

// @desc    Get all transactions for a group
// @route   GET /api/transactions/:groupId
// @access  Private
const getTransactions = async (req, res) => {
  try {
    const { groupId } = req.params;

    // Check if user has access to group
    const group = await Group.findOne({
      _id: groupId,
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    });

    if (!group) {
      return res.status(404).json({ message: 'Group not found or access denied' });
    }

    const transactions = await Transaction.find({ group: groupId })
      .sort({ date: -1 });

    // Map MongoDB _id to id for frontend consistency
    const formattedTransactions = transactions.map(t => ({
      id: t._id,
      date: t.date,
      description: t.description,
      category: t.category,
      amount: t.amount,
      type: t.type,
      status: t.status,
      groupId: t.group
    }));

    res.json(formattedTransactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create transaction
// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res) => {
  try { 
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { description, amount, type, category, status, groupId, payer} = req.body;

    // Check if user has access to group
    const group = await Group.findOne({
      _id: groupId,
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    });

    if (!group) {
      return res.status(404).json({ message: 'Group not found or access denied' });
    }

    const transaction = await Transaction.create({
      description,
      amount,
      type,
      category,
      status,
      group: groupId,
      createdBy: req.user._id,
      payer: payer || req.user._id,
    });

    // Format response
    const formattedTransaction = {
      id: transaction._id,
      date: transaction.date,
      description: transaction.description,
      category: transaction.category,
      amount: transaction.amount,
      type: transaction.type,
      status: transaction.status,
      groupId: transaction.group,
      payer: transaction.payer
    };

    res.status(201).json(formattedTransaction);
  } catch (error) {
    console.error('Create transaction error:', error);
    console.error('Error details:', error.message); // Add this
    console.error('Request body:', req.body); // Add this
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check if user has access to group
    const group = await Group.findOne({
      _id: transaction.group,
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    });

    if (!group) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update fields
    Object.keys(updates).forEach(key => {
      if (key !== 'id' && key !== 'groupId') {
        transaction[key] = updates[key];
      }
    });

    await transaction.save();

    // Format response
    const formattedTransaction = {
      id: transaction._id,
      date: transaction.date,
      description: transaction.description,
      category: transaction.category,
      amount: transaction.amount,
      type: transaction.type,
      status: transaction.status,
      groupId: transaction.group
    };

    res.json(formattedTransaction);
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check if user has access to group
    const group = await Group.findOne({
      _id: transaction.group,
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    });

    if (!group) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Transaction.findByIdAndDelete(id);
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction
};