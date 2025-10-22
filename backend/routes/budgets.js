const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');

// @route   GET /api/budgets
// @desc    Get all budgets for a group
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // Placeholder - will implement controller
    res.json({ message: 'Get all budgets' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/budgets
// @desc    Create a new budget
// @access  Private
router.post('/', [
  auth,
  body('name').trim().notEmpty().withMessage('Budget name is required'),
  body('group').notEmpty().withMessage('Group ID is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('limit').isNumeric().withMessage('Limit must be a number'),
  body('period').isIn(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']).withMessage('Invalid period')
], async (req, res) => {
  try {
    // Placeholder - will implement controller
    res.json({ message: 'Create budget' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/budgets/:id
// @desc    Get a single budget
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    // Placeholder - will implement controller
    res.json({ message: 'Get budget by ID' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   PUT /api/budgets/:id
// @desc    Update a budget
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    // Placeholder - will implement controller
    res.json({ message: 'Update budget' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   DELETE /api/budgets/:id
// @desc    Delete a budget
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    // Placeholder - will implement controller
    res.json({ message: 'Delete budget' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;