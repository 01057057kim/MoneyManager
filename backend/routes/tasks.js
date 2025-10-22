const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');

// @route   GET /api/tasks
// @desc    Get all tasks for a group
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // Placeholder - will implement controller
    res.json({ message: 'Get all tasks' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private
router.post('/', [
  auth,
  body('title').trim().notEmpty().withMessage('Task title is required'),
  body('group').notEmpty().withMessage('Group ID is required'),
  body('priority').isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority level')
], async (req, res) => {
  try {
    // Placeholder - will implement controller
    res.json({ message: 'Create task' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get a single task
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    // Placeholder - will implement controller
    res.json({ message: 'Get task by ID' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update a task
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    // Placeholder - will implement controller
    res.json({ message: 'Update task' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    // Placeholder - will implement controller
    res.json({ message: 'Delete task' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   PUT /api/tasks/:id/status
// @desc    Update task status
// @access  Private
router.put('/:id/status', [
  auth,
  body('status').isIn(['pending', 'in-progress', 'completed', 'cancelled']).withMessage('Invalid status')
], async (req, res) => {
  try {
    // Placeholder - will implement controller
    res.json({ message: 'Update task status' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;