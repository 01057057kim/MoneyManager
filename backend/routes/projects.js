const express = require('express');
const router = express.Router();
const {
  getProjects,
  createProject,
  updateProject,
  deleteProject
} = require('../controllers/projectController');
const auth = require('../middleware/auth');

// All routes are protected
router.use(auth);

// @route   GET /api/projects
// @desc    Get all projects for a group
// @access  Private
router.get('/', getProjects);

// @route   POST /api/projects
// @desc    Create new project
// @access  Private
router.post('/', createProject);

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private
router.put('/:id', updateProject);

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Private
router.delete('/:id', deleteProject);

module.exports = router;
