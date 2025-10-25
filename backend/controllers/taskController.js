const Task = require('../models/Task');
const { validationResult } = require('express-validator');

// @route   GET /api/tasks
// @desc    Get all tasks for a group
// @access  Private
const getTasks = async (req, res) => {
  try {
    const { groupId, status, assignee, priority } = req.query;
    const query = { group: groupId || req.user.activeGroup };

    if (status) query.status = status;
    if (assignee) query.assignee = assignee;
    if (priority) query.priority = priority;

    const tasks = await Task.find(query)
      .populate('creator', 'name email')
      .populate('assignee', 'name email')
      .populate('linkedRecords.transaction')
      .populate('linkedRecords.client')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: error.message });
  }
};

// @route   GET /api/tasks/:id
// @desc    Get a single task
// @access  Private
const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('creator', 'name email')
      .populate('assignee', 'name email')
      .populate('linkedRecords.transaction')
      .populate('linkedRecords.client')
      .populate('comments.user', 'name email');

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: error.message });
  }
};

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private
const createTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      group,
      assignee,
      dueDate,
      priority,
      linkedRecords,
      tags,
      checklist
    } = req.body;

    const task = new Task({
      title,
      description,
      group: group || req.user.activeGroup,
      creator: req.user.id,
      assignee,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      priority: priority || 'medium',
      linkedRecords,
      tags: tags || [],
      checklist: checklist || []
    });

    await task.save();
    await task.populate('creator', 'name email');
    await task.populate('assignee', 'name email');

    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: error.message });
  }
};

// @route   PUT /api/tasks/:id
// @desc    Update a task
// @access  Private
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check if user can edit task
    if (!task.canEdit(req.user.id)) {
      return res.status(403).json({ error: 'Not authorized to edit this task' });
    }

    const {
      title,
      description,
      assignee,
      dueDate,
      priority,
      status,
      linkedRecords,
      tags,
      checklist
    } = req.body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignee !== undefined) task.assignee = assignee;
    if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null;
    if (priority !== undefined) task.priority = priority;
    if (status !== undefined) task.status = status;
    if (linkedRecords !== undefined) task.linkedRecords = linkedRecords;
    if (tags !== undefined) task.tags = tags;
    if (checklist !== undefined) task.checklist = checklist;

    await task.save();
    await task.populate('creator', 'name email');
    await task.populate('assignee', 'name email');

    res.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: error.message });
  }
};

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check if user can edit task
    if (!task.canEdit(req.user.id)) {
      return res.status(403).json({ error: 'Not authorized to delete this task' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: error.message });
  }
};

// @route   PUT /api/tasks/:id/status
// @desc    Update task status
// @access  Private
const updateTaskStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check if user can edit task
    if (!task.canEdit(req.user.id)) {
      return res.status(403).json({ error: 'Not authorized to update this task' });
    }

    task.status = req.body.status;
    await task.save();

    res.json(task);
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ error: error.message });
  }
};

// @route   POST /api/tasks/:id/comments
// @desc    Add comment to task
// @access  Private
const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    task.comments.push({
      user: req.user.id,
      content: content.trim()
    });

    await task.save();
    await task.populate('comments.user', 'name email');

    res.json(task);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: error.message });
  }
};

// @route   PUT /api/tasks/:id/checklist/:itemId
// @desc    Update checklist item
// @access  Private
const updateChecklistItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { completed } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const item = task.checklist.id(itemId);
    if (!item) {
      return res.status(404).json({ error: 'Checklist item not found' });
    }

    item.completed = completed;
    if (completed) {
      item.completedAt = new Date();
      item.completedBy = req.user.id;
    } else {
      item.completedAt = undefined;
      item.completedBy = undefined;
    }

    await task.save();
    res.json(task);
  } catch (error) {
    console.error('Error updating checklist item:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  addComment,
  updateChecklistItem
};
