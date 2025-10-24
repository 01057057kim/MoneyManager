const RecurringTransaction = require('../models/RecurringTransaction');
const Transaction = require('../models/Transaction');
const Group = require('../models/Group');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

// Helper function to validate ObjectId
const isValidObjectId = (id) => {
  return id && mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === String(id);
};

// @desc    Get all recurring transactions for a group
// @route   GET /api/recurring
// @access  Private
const getRecurringTransactions = async (req, res) => {
  try {
    const { groupId, isActive, frequency } = req.query;
    const userId = req.user.id;

    // Build query
    const query = {};
    
    if (groupId) {
      // Verify user has access to this group
      const group = await Group.findOne({ 
        _id: groupId, 
        $or: [
          { owner: userId },
          { 'members.user': userId }
        ]
      });
      
      if (!group) {
        return res.status(403).json({ error: 'Access denied to this group' });
      }
      
      query.group = groupId;
    } else {
      // Get all groups user has access to
      const userGroups = await Group.find({
        $or: [
          { owner: userId },
          { 'members.user': userId }
        ]
      }).select('_id');
      
      query.group = { $in: userGroups.map(g => g._id) };
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (frequency) {
      query.frequency = frequency;
    }

    const recurringTransactions = await RecurringTransaction.find(query)
      .populate('group', 'name')
      .populate('payer', 'name email')
      .populate('participants.user', 'name email')
      .populate('client', 'name')
      .sort({ createdAt: -1 });

    res.json(recurringTransactions);
  } catch (error) {
    console.error('Error fetching recurring transactions:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Get a single recurring transaction
// @route   GET /api/recurring/:id
// @access  Private
const getRecurringTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const recurringTransaction = await RecurringTransaction.findById(id)
      .populate('group', 'name')
      .populate('payer', 'name email')
      .populate('participants.user', 'name email')
      .populate('client', 'name');

    if (!recurringTransaction) {
      return res.status(404).json({ error: 'Recurring transaction not found' });
    }

    // Verify user has access to the group
    const group = await Group.findOne({
      _id: recurringTransaction.group._id,
        $or: [
          { owner: userId },
          { 'members.user': userId }
        ]
    });

    if (!group) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(recurringTransaction);
  } catch (error) {
    console.error('Error fetching recurring transaction:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Create a new recurring transaction
// @route   POST /api/recurring
// @access  Private
const createRecurringTransaction = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const {
      title,
      amount,
      type,
      category,
      group,
      frequency,
      startDate,
      endDate,
      payer,
      participants,
      notes,
      client
    } = req.body;

    // Verify user has access to the group
    const groupDoc = await Group.findOne({
      _id: group,
        $or: [
          { owner: userId },
          { 'members.user': userId }
        ]
    });

    if (!groupDoc) {
      return res.status(403).json({ error: 'Access denied to this group' });
    }

    // Validate payer ObjectId
    const payerId = payer || userId;
    if (!isValidObjectId(payerId)) {
      return res.status(400).json({ error: 'Invalid payer ID' });
    }

    // Validate client ObjectId if provided
    let clientId = null;
    if (client && client !== '') {
      if (!isValidObjectId(client)) {
        return res.status(400).json({ error: 'Invalid client ID' });
      }
      clientId = client;
    }

    // Validate participants
    if (participants && participants.length > 0) {
      // Validate participant user IDs
      for (const p of participants) {
        if (!isValidObjectId(p.user)) {
          return res.status(400).json({ 
            error: `Invalid user ID in participants: ${p.user}` 
          });
        }
      }

      const totalShare = participants.reduce((sum, p) => sum + p.share, 0);
      if (Math.abs(totalShare - amount) > 0.01) {
        return res.status(400).json({ 
          error: 'Total participant shares must equal the transaction amount' 
        });
      }
    }

    // Build transaction data
    const transactionData = {
      title,
      amount,
      type,
      category,
      group,
      frequency,
      startDate: new Date(startDate),
      payer: payerId,
      participants: participants || [],
      notes,
      isActive: true
    };

    // Only add endDate if provided
    if (endDate) {
      transactionData.endDate = new Date(endDate);
    }

    // Only add client if valid
    if (clientId) {
      transactionData.client = clientId;
    }

    const recurringTransaction = new RecurringTransaction(transactionData);

    await recurringTransaction.save();

    // Populate the response
    await recurringTransaction.populate([
      { path: 'group', select: 'name' },
      { path: 'payer', select: 'name email' },
      { path: 'participants.user', select: 'name email' },
      { path: 'client', select: 'name' }
    ]);

    res.status(201).json(recurringTransaction);
  } catch (error) {
    console.error('Error creating recurring transaction:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Update a recurring transaction
// @route   PUT /api/recurring/:id
// @access  Private
const updateRecurringTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = { ...req.body };

    const recurringTransaction = await RecurringTransaction.findById(id);
    if (!recurringTransaction) {
      return res.status(404).json({ error: 'Recurring transaction not found' });
    }

    // Verify user has access to the group
    const group = await Group.findOne({
      _id: recurringTransaction.group,
        $or: [
          { owner: userId },
          { 'members.user': userId }
        ]
    });

    if (!group) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Validate payer if provided
    if (updateData.payer && !isValidObjectId(updateData.payer)) {
      return res.status(400).json({ error: 'Invalid payer ID' });
    }

    // Validate and sanitize client field
    if ('client' in updateData) {
      if (updateData.client === '' || updateData.client === null) {
        delete updateData.client; // Remove empty client
      } else if (!isValidObjectId(updateData.client)) {
        return res.status(400).json({ error: 'Invalid client ID' });
      }
    }

    // Handle date fields
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate);
    }

    // Validate participants if provided
    if (updateData.participants && updateData.participants.length > 0) {
      // Validate participant user IDs
      for (const p of updateData.participants) {
        if (!isValidObjectId(p.user)) {
          return res.status(400).json({ 
            error: `Invalid user ID in participants: ${p.user}` 
          });
        }
      }

      const totalShare = updateData.participants.reduce((sum, p) => sum + p.share, 0);
      if (Math.abs(totalShare - (updateData.amount || recurringTransaction.amount)) > 0.01) {
        return res.status(400).json({ 
          error: 'Total participant shares must equal the transaction amount' 
        });
      }
    }

    const updatedRecurringTransaction = await RecurringTransaction.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: 'group', select: 'name' },
      { path: 'payer', select: 'name email' },
      { path: 'participants.user', select: 'name email' },
      { path: 'client', select: 'name' }
    ]);

    res.json(updatedRecurringTransaction);
  } catch (error) {
    console.error('Error updating recurring transaction:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Delete a recurring transaction
// @route   DELETE /api/recurring/:id
// @access  Private
const deleteRecurringTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const recurringTransaction = await RecurringTransaction.findById(id);
    if (!recurringTransaction) {
      return res.status(404).json({ error: 'Recurring transaction not found' });
    }

    // Verify user has access to the group
    const group = await Group.findOne({
      _id: recurringTransaction.group,
        $or: [
          { owner: userId },
          { 'members.user': userId }
        ]
    });

    if (!group) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await RecurringTransaction.findByIdAndDelete(id);
    res.json({ message: 'Recurring transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting recurring transaction:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Execute a recurring transaction manually
// @route   POST /api/recurring/:id/execute
// @access  Private
const executeRecurringTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const recurringTransaction = await RecurringTransaction.findById(id)
      .populate('group')
      .populate('payer')
      .populate('participants.user');

    if (!recurringTransaction) {
      return res.status(404).json({ error: 'Recurring transaction not found' });
    }

    // Verify user has access to the group
    const group = await Group.findOne({
      _id: recurringTransaction.group._id,
        $or: [
          { owner: userId },
          { 'members.user': userId }
        ]
    });

    if (!group) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Create the transaction
    const transactionData = {
      description: recurringTransaction.title,
      amount: recurringTransaction.amount,
      type: recurringTransaction.type,
      category: recurringTransaction.category,
      date: new Date(),
      group: recurringTransaction.group._id,
      payer: recurringTransaction.payer._id,
      participants: recurringTransaction.participants.map(p => ({
        user: p.user._id,
        share: p.share
      })),
      notes: recurringTransaction.notes,
      recurringId: recurringTransaction._id
    };

    // Only add client if it exists
    if (recurringTransaction.client) {
      transactionData.client = recurringTransaction.client;
    }

    const transaction = new Transaction(transactionData);

    await transaction.save();

    // Update last processed date
    recurringTransaction.lastProcessed = new Date();
    await recurringTransaction.save();

    // Populate the created transaction
    await transaction.populate([
      { path: 'group', select: 'name' },
      { path: 'payer', select: 'name email' },
      { path: 'participants.user', select: 'name email' },
      { path: 'client', select: 'name' }
    ]);

    res.json(transaction);
  } catch (error) {
    console.error('Error executing recurring transaction:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Get due recurring transactions
// @route   GET /api/recurring/due
// @access  Private
const getDueRecurringTransactions = async (req, res) => {
  try {
    console.log('getDueRecurringTransactions called with:', { userId: req.user.id, groupId: req.query.groupId });
    const userId = req.user.id;
    const { groupId } = req.query;

    // Get user's groups
    let groupQuery = {
        $or: [
          { owner: userId },
          { 'members.user': userId }
        ]
    };

    if (groupId) {
      groupQuery._id = groupId;
    }

    const userGroups = await Group.find(groupQuery).select('_id');
    console.log('Found user groups:', userGroups);
    const groupIds = userGroups.map(g => g._id);
    console.log('Group IDs:', groupIds);

    // Find recurring transactions that are due
    const now = new Date();
    const recurringTransactions = await RecurringTransaction.find({
      group: { $in: groupIds },
      isActive: true,
      $or: [
        { endDate: { $exists: false } },
        { endDate: { $gt: now } }
      ]
    })
    .populate('group', 'name')
    .populate('payer', 'name email')
    .populate('participants.user', 'name email');

    // Filter for due transactions
    const dueTransactions = recurringTransactions.filter(rt => rt.isDue());

    res.json(dueTransactions);
  } catch (error) {
    console.error('Error fetching due recurring transactions:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getRecurringTransactions,
  getRecurringTransaction,
  createRecurringTransaction,
  updateRecurringTransaction,
  deleteRecurringTransaction,
  executeRecurringTransaction,
  getDueRecurringTransactions
};