const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Group = require('../models/Group');
const { validationResult } = require('express-validator');

// @desc    Get all categories for a group
// @route   GET /api/categories
// @access  Private
const getCategories = async (req, res) => {
  try {
    const { groupId } = req.query;
    const userId = req.user.id;

    // Verify user has access to the group
    let group;
    if (groupId) {
      group = await Group.findOne({
        _id: groupId,
        $or: [
          { owner: userId },
          { 'members.user': userId }
        ]
      });

      if (!group) {
        return res.status(403).json({ error: 'Access denied to this group' });
      }
    } else {
      // Get user's groups
      const userGroups = await Group.find({
        $or: [
          { owner: userId },
          { 'members.user': userId }
        ]
      }).select('_id');

      if (userGroups.length === 0) {
        return res.json([]);
      }

      group = { _id: { $in: userGroups.map(g => g._id) } };
    }

    // Get category spending totals
    const categorySpending = await Transaction.aggregate([
      { $match: { group: group._id || { $in: group._id.$in } } },
      { 
        $group: { 
          _id: '$category', 
          totalSpent: { $sum: '$amount' },
          transactionCount: { $sum: 1 },
          lastTransaction: { $max: '$date' }
        } 
      },
      { $sort: { totalSpent: -1 } }
    ]);

    // Get budget information for each category
    const budgets = await Budget.find({ 
      group: group._id || { $in: group._id.$in },
      isActive: true 
    }).select('category limit period');

    const categoriesWithDetails = categorySpending.map(category => {
      const budget = budgets.find(b => b.category === category._id);
      return {
        name: category._id,
        totalSpent: category.totalSpent,
        transactionCount: category.transactionCount,
        lastTransaction: category.lastTransaction,
        budget: budget ? {
          limit: budget.limit,
          period: budget.period,
          remaining: budget.limit - category.totalSpent,
          percentageUsed: (category.totalSpent / budget.limit) * 100
        } : null
      };
    });

    res.json(categoriesWithDetails);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Get category analytics
// @route   GET /api/categories/:name/analytics
// @access  Private
const getCategoryAnalytics = async (req, res) => {
  try {
    const { name } = req.params;
    const { groupId, period = 'monthly' } = req.query;
    const userId = req.user.id;

    // Verify user has access to the group
    let group;
    if (groupId) {
      group = await Group.findOne({
        _id: groupId,
        $or: [
          { owner: userId },
          { 'members.user': userId }
        ]
      });

      if (!group) {
        return res.status(403).json({ error: 'Access denied to this group' });
      }
    } else {
      // Get user's groups
      const userGroups = await Group.find({
        $or: [
          { owner: userId },
          { 'members.user': userId }
        ]
      }).select('_id');

      if (userGroups.length === 0) {
        return res.status(404).json({ error: 'No groups found' });
      }

      group = { _id: { $in: userGroups.map(g => g._id) } };
    }

    // Get period dates
    const periodDates = getPeriodDates(period);

    // Get transactions for this category
    const transactions = await Transaction.find({
      group: group._id || { $in: group._id.$in },
      category: name,
      date: {
        $gte: periodDates.start,
        $lte: periodDates.end
      }
    }).populate('payer', 'name').sort({ date: -1 });

    // Calculate analytics
    const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
    const averageTransaction = transactions.length > 0 ? totalSpent / transactions.length : 0;

    // Get daily spending breakdown
    const dailySpending = {};
    transactions.forEach(transaction => {
      const date = transaction.date.toISOString().split('T')[0];
      dailySpending[date] = (dailySpending[date] || 0) + transaction.amount;
    });

    // Get top spenders
    const spenders = {};
    transactions.forEach(transaction => {
      const payerName = transaction.payer.name;
      spenders[payerName] = (spenders[payerName] || 0) + transaction.amount;
    });

    const topSpenders = Object.entries(spenders)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Get budget information
    const budget = await Budget.findOne({
      group: group._id || { $in: group._id.$in },
      category: name,
      isActive: true
    });

    res.json({
      category: name,
      period,
      analytics: {
        totalSpent,
        transactionCount: transactions.length,
        averageTransaction,
        dailySpending,
        topSpenders,
        budget: budget ? {
          limit: budget.limit,
          period: budget.period,
          remaining: budget.limit - totalSpent,
          percentageUsed: (totalSpent / budget.limit) * 100,
          status: getBudgetStatus(totalSpent, budget.limit)
        } : null
      },
      transactions: transactions.slice(0, 10)
    });
  } catch (error) {
    console.error('Error fetching category analytics:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private
const createCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, groupId, description, color, icon } = req.body;
    const userId = req.user.id;

    // Verify user has access to the group
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

    // Check if category already exists (has transactions)
    const existingCategory = await Transaction.findOne({
      group: groupId,
      category: name
    });

    if (existingCategory) {
      return res.status(400).json({ error: 'Category already exists' });
    }

    // ✅ CREATE A PLACEHOLDER TRANSACTION so category appears immediately
    // This is a zero-amount placeholder that makes the category visible
    const placeholderTransaction = new Transaction({
      group: groupId,
      payer: userId,
      amount: 0,
      category: name,
      description: `Category "${name}" created`,
      date: new Date(),
      isPlaceholder: true // Add this field to mark it as placeholder
    });

    await placeholderTransaction.save();

    res.status(201).json({
      message: 'Category created successfully',
      category: {
        name,
        groupId,
        description,
        color,
        icon,
        totalSpent: 0,
        transactionCount: 0,
        lastTransaction: new Date()
      }
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Update category name (bulk update transactions)
// @route   PUT /api/categories/:oldName
// @access  Private
const updateCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { oldName } = req.params;
    const { newName, groupId } = req.body;
    const userId = req.user.id;

    // Verify user has access to the group
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

    // Check if new name already exists
    const existingCategory = await Transaction.findOne({
      group: groupId,
      category: newName
    });

    if (existingCategory && oldName !== newName) {
      return res.status(400).json({ error: 'A category with this name already exists' });
    }

    // Update all transactions with the old category name
    const result = await Transaction.updateMany(
      { group: groupId, category: oldName },
      { $set: { category: newName } }
    );

    // Update budgets with the old category name
    await Budget.updateMany(
      { group: groupId, category: oldName },
      { $set: { category: newName } }
    );

    res.json({
      message: 'Category updated successfully',
      updatedTransactions: result.modifiedCount
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Delete category (bulk update transactions)
// @route   DELETE /api/categories/:name
// @access  Private
const deleteCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name } = req.params;
    const { groupId, newCategory } = req.body;
    const userId = req.user.id;

    // Verify user has access to the group
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

    if (!newCategory) {
      return res.status(400).json({ error: 'New category name is required' });
    }

    // Update all transactions with the old category name
    const result = await Transaction.updateMany(
      { group: groupId, category: name },
      { $set: { category: newCategory } }
    );

    // Update budgets with the old category name
    await Budget.updateMany(
      { group: groupId, category: name },
      { $set: { category: newCategory } }
    );

    res.json({
      message: 'Category deleted successfully',
      updatedTransactions: result.modifiedCount
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Helper function to get period dates
const getPeriodDates = (period) => {
  const now = new Date();
  let start = new Date();
  let end = new Date(now);

  switch (period) {
    case 'daily':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'weekly':
      start.setDate(now.getDate() - now.getDay());
      end.setDate(start.getDate() + 6);
      break;
    case 'monthly':
      start.setDate(1);
      end.setMonth(start.getMonth() + 1);
      end.setDate(0);
      break;
    case 'quarterly':
      const quarter = Math.floor(now.getMonth() / 3);
      start.setMonth(quarter * 3, 1);
      end.setMonth(quarter * 3 + 3, 0);
      break;
    case 'yearly':
      start.setMonth(0, 1);
      end.setMonth(11, 31);
      break;
  }

  return { start, end };
};

// Helper function to get budget status
const getBudgetStatus = (spent, limit) => {
  const percentage = (spent / limit) * 100;
  if (percentage >= 100) return 'exceeded';
  if (percentage >= 90) return 'critical';
  if (percentage >= 75) return 'warning';
  return 'safe';
};

module.exports = {
  getCategories,
  getCategoryAnalytics,
  createCategory,
  updateCategory,
  deleteCategory
};