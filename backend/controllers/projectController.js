const Project = require('../models/Project');

// @desc    Get all projects for a group
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    const { groupId } = req.query;
    
    if (!groupId) {
      return res.status(400).json({ message: 'Group ID is required' });
    }

    const projects = await Project.find({ groupId })
      .populate('clientId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: projects.length,
      projects
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      clientId, 
      status, 
      startDate, 
      endDate, 
      budget, 
      hourlyRate, 
      totalHours, 
      progress, 
      notes, 
      groupId 
    } = req.body;

    // Validation
    if (!name || !clientId || !groupId) {
      return res.status(400).json({ message: 'Name, clientId, and groupId are required' });
    }

    const project = new Project({
      name,
      description,
      clientId,
      status: status || 'planning',
      startDate,
      endDate,
      budget,
      hourlyRate,
      totalHours,
      progress: progress || 0,
      notes,
      groupId,
      createdBy: req.user._id
    });

    await project.save();

    // Populate client info
    await project.populate('clientId', 'name email');

    res.status(201).json({
      success: true,
      project
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const project = await Project.findById(id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user has access to this project's group
    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('clientId', 'name email');

    res.json({
      success: true,
      project: updatedProject
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user has access to this project's group
    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }

    await Project.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getProjects,
  createProject,
  updateProject,
  deleteProject
};
