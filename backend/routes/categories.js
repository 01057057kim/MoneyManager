const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const {
  getCategories,
  getCategoryAnalytics,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');

// @route   GET /api/categories
// @desc    Get all categories for a group
// @access  Private
router.get('/', auth, getCategories);

// @route   GET /api/categories/:name/analytics
// @desc    Get category analytics
// @access  Private
router.get('/:name/analytics', auth, getCategoryAnalytics);

// @route   POST /api/categories
// @desc    Create a new category
// @access  Private
router.post('/', [
  auth,
  body('name').trim().notEmpty().withMessage('Category name is required'),
  body('groupId').notEmpty().withMessage('Group ID is required')
], createCategory);

// @route   PUT /api/categories/:oldName
// @desc    Update category name
// @access  Private
router.put('/:oldName', [
  auth,
  body('newName').trim().notEmpty().withMessage('New category name is required'),
  body('groupId').notEmpty().withMessage('Group ID is required')
], updateCategory);

// @route   DELETE /api/categories/:name
// @desc    Delete category (merge transactions to another category)
// @access  Private
router.delete('/:name', [
  auth,
  body('groupId').notEmpty().withMessage('Group ID is required'),
  body('newCategory').trim().notEmpty().withMessage('New category name is required')
], deleteCategory);

module.exports = router;