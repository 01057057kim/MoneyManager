const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  addComment,
  updateChecklistItem
} = require('../controllers/taskController');

// @route   GET /api/tasks
// @desc    Get all tasks for a group
// @access  Private
router.get('/', auth, getTasks);

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private
router.post('/', [
  auth,
  body('title').trim().notEmpty().withMessage('Task title is required'),
  body('group').notEmpty().withMessage('Group ID is required'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority level')
], createTask);

// @route   GET /api/tasks/:id
// @desc    Get a single task
// @access  Private
router.get('/:id', auth, getTask);

// @route   PUT /api/tasks/:id
// @desc    Update a task
// @access  Private
router.put('/:id', auth, updateTask);

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', auth, deleteTask);

// @route   PUT /api/tasks/:id/status
// @desc    Update task status
// @access  Private
router.put('/:id/status', [
  auth,
  body('status').isIn(['pending', 'in-progress', 'completed', 'cancelled']).withMessage('Invalid status')
], updateTaskStatus);

// @route   POST /api/tasks/:id/comments
// @desc    Add comment to task
// @access  Private
router.post('/:id/comments', [
  auth,
  body('content').trim().notEmpty().withMessage('Comment content is required')
], addComment);

// @route   PUT /api/tasks/:id/checklist/:itemId
// @desc    Update checklist item
// @access  Private
router.put('/:id/checklist/:itemId', auth, updateChecklistItem);

module.exports = router;