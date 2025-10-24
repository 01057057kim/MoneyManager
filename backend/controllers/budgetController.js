const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const Group = require('../models/Group');
const { validationResult } = require('express-validator');

// @desc    Get all budgets for a group
// @route   GET /api/budgets
// @access  Private
const getBudgets = async (req, res) => {
  try {
    const { groupId, isActive, period, category, limit = 50, page = 1 } = req.query;
    const userId = req.user.id;

    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

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
        return res.status(403).json({ 
          success: false,
          error: 'Access denied to this group',
          timestamp: new Date().toISOString()
        });
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
      
      if (userGroups.length === 0) {
        return res.json({
          success: true,
          data: [],
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: 0,
            pages: 0
          }
        });
      }
      
      query.group = { $in: userGroups.map(g => g._id) };
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (period) {
      query.period = period;
    }

    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }

    // Get total count for pagination
    const total = await Budget.countDocuments(query);

    const budgets = await Budget.find(query)
      .populate('group', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Calculate spent amounts for each budget
    const budgetsWithSpent = await Promise.all(
      budgets.map(async (budget) => {
        const spent = await calculateBudgetSpent(budget);
        return {
          ...budget.toObject(),
          spent,
          remaining: budget.limit - spent,
          percentageUsed: (spent / budget.limit) * 100,
          status: getBudgetStatus(spent, budget.limit)
        };
      })
    );

    res.json({
      success: true,
      data: budgetsWithSpent,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch budgets',
      message: 'An error occurred while retrieving budget data',
      timestamp: new Date().toISOString()
    });
  }
};

// @desc    Get a single budget
// @route   GET /api/budgets/:id
// @access  Private
const getBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const budget = await Budget.findById(id).populate('group', 'name');

    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    // Verify user has access to the group
    const group = await Group.findOne({
      _id: budget.group._id,
      $or: [
        { owner: userId },
        { 'members.user': userId }
      ]
    });

    if (!group) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Calculate spent amount
    const spent = await calculateBudgetSpent(budget);
    const budgetWithSpent = {
      ...budget.toObject(),
      spent,
      remaining: budget.limit - spent,
      percentageUsed: (spent / budget.limit) * 100,
      status: getBudgetStatus(spent, budget.limit)
    };

    res.json(budgetWithSpent);
  } catch (error) {
    console.error('Error fetching budget:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Create a new budget
// @route   POST /api/budgets
// @access  Private
const createBudget = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        error: 'Validation Error',
        messages: errors.array(),
        timestamp: new Date().toISOString()
      });
    }

    const userId = req.user.id;
    let {
      name,
      group,
      category,
      limit,
      period,
      startDate,
      endDate,
      notifications,
      tags,
      notes
    } = req.body;

    // Convert tags from string to array if needed
    if (tags && typeof tags === 'string') {
      tags = tags.split(',').map(tag => tag.trim()).filter(Boolean);
    } else if (!tags) {
      tags = [];
    }

    // Verify user has access to the group
    const groupDoc = await Group.findOne({
      _id: group,
      $or: [
        { owner: userId },
        { 'members.user': userId }
      ]
    });

    if (!groupDoc) {
      return res.status(403).json({ 
        success: false,
        error: 'Access denied to this group',
        message: 'You do not have permission to create budgets for this group',
        timestamp: new Date().toISOString()
      });
    }

    // Check for duplicate budget in the same category and period
    const existingBudget = await Budget.findOne({
      group,
      category,
      period,
      isActive: true
    });

    if (existingBudget) {
      return res.status(400).json({
        success: false,
        error: 'Duplicate Budget',
        message: `A budget for ${category} (${period}) already exists in this group`,
        timestamp: new Date().toISOString()
      });
    }

    const budget = new Budget({
      name,
      group,
      category,
      limit: parseFloat(limit),
      period,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : undefined,
      notifications: notifications || { enabled: true, thresholds: [] },
      tags,
      notes,
      isActive: true
    });

    await budget.save();

    // Populate the response
    await budget.populate('group', 'name');

    // Calculate initial spent amount
    const spent = await calculateBudgetSpent(budget);

    res.status(201).json({
      success: true,
      data: {
        ...budget.toObject(),
        spent,
        remaining: budget.limit - spent,
        percentageUsed: (spent / budget.limit) * 100,
        status: getBudgetStatus(spent, budget.limit)
      },
      message: 'Budget created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating budget:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create budget',
      message: error.message || 'An error occurred while creating the budget',
      timestamp: new Date().toISOString()
    });
  }
};

// @desc    Update a budget
// @route   PUT /api/budgets/:id
// @access  Private
const updateBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    let updateData = req.body;

    const budget = await Budget.findById(id);
    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    // Verify user has access to the group
    const group = await Group.findOne({
      _id: budget.group,
      $or: [
        { owner: userId },
        { 'members.user': userId }
      ]
    });

    if (!group) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Convert tags from string to array if needed
    if (updateData.tags && typeof updateData.tags === 'string') {
      updateData.tags = updateData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
    }

    // Handle date fields
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate);
    }

    const updatedBudget = await Budget.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('group', 'name');

    res.json(updatedBudget);
  } catch (error) {
    console.error('Error updating budget:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Delete a budget
// @route   DELETE /api/budgets/:id
// @access  Private
const deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const budget = await Budget.findById(id);
    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    // Verify user has access to the group - FIXED
    const group = await Group.findOne({
      _id: budget.group,
      $or: [
        { owner: userId },
        { 'members.user': userId }  // ✅ Fixed: was just 'members'
      ]
    });

    if (!group) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await Budget.findByIdAndDelete(id);
    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Error deleting budget:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
};

// @desc    Get budget analytics
// @route   GET /api/budgets/:id/analytics
// @access  Private
const getBudgetAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const budget = await Budget.findById(id);
    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    // Verify user has access to the group
    const group = await Group.findOne({
      _id: budget.group,
      $or: [
        { owner: userId },
        { 'members.user': userId }
      ]
    });

    if (!group) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get transactions for this budget's category and period
    const periodDates = getPeriodDates(budget.period, budget.startDate);
    const transactions = await Transaction.find({
      group: budget.group,
      category: budget.category,
      type: 'expense',
      date: {
        $gte: periodDates.start,
        $lte: periodDates.end
      }
    }).populate('payer', 'name');

    const spent = transactions.reduce((sum, t) => sum + t.amount, 0);
    const remaining = budget.limit - spent;
    const percentageUsed = (spent / budget.limit) * 100;

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

    res.json({
      budget: {
        ...budget.toObject(),
        spent,
        remaining,
        percentageUsed,
        status: getBudgetStatus(spent, budget.limit)
      },
      analytics: {
        dailySpending,
        topSpenders,
        transactionCount: transactions.length,
        averageTransaction: transactions.length > 0 ? spent / transactions.length : 0
      }
    });
  } catch (error) {
    console.error('Error fetching budget analytics:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Helper function to calculate spent amount for a budget
const calculateBudgetSpent = async (budget) => {
  const periodDates = getPeriodDates(budget.period, budget.startDate);
  
  const transactions = await Transaction.find({
    group: budget.group,
    category: budget.category,
    type: 'expense',
    date: {
      $gte: periodDates.start,
      $lte: periodDates.end
    }
  });

  return transactions.reduce((sum, t) => sum + t.amount, 0);
};

// Helper function to get period dates
const getPeriodDates = (period, startDate) => {
  const now = new Date();
  let start = new Date(startDate);
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
  getBudgets,
  getBudget,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetAnalytics
};