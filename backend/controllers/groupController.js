const { validationResult } = require('express-validator');
const Group = require('../models/Group');

// @desc    Create group
// @route   POST /api/groups/create
// @access  Private
const createGroup = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, currency, taxRate } = req.body;

    // Generate invite key (8 characters alphanumeric)
    const inviteKey = Math.random().toString(36).substring(2, 10).toUpperCase();

    // Create group
    const group = await Group.create({
      name,
      currency,
      taxRate,
      owner: req.user._id,
      inviteKey
    });

    // Populate owner details
    await group.populate('owner', 'name email');

    res.status(201).json({
      message: 'Group created successfully',
      group: {
        id: group._id,
        name: group.name,
        currency: group.currency,
        taxRate: group.taxRate,
        inviteKey: group.inviteKey,
        owner: group.owner,
        members: group.members,
        createdAt: group.createdAt
      }
    });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Join group
// @route   POST /api/groups/join
// @access  Private
const joinGroup = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { inviteKey } = req.body;

    // Find group by invite key
    const group = await Group.findOne({ inviteKey });
    if (!group) {
      return res.status(400).json({ message: 'Invalid invite key' });
    }

    // Check if user is already a member
    const isAlreadyMember = group.members.some(
      member => member.user.toString() === req.user._id.toString()
    );

    if (isAlreadyMember) {
      return res.status(400).json({ message: 'You are already a member of this group' });
    }

    // Add user as member
    group.members.push({
      user: req.user._id,
      role: 'Viewer'
    });

    await group.save();

    // Populate member details
    await group.populate('members.user', 'name email');
    await group.populate('owner', 'name email');

    res.json({
      message: 'Successfully joined group',
      group: {
        id: group._id,
        name: group.name,
        currency: group.currency,
        taxRate: group.taxRate,
        inviteKey: group.inviteKey,
        owner: group.owner,
        members: group.members,
        createdAt: group.createdAt
      }
    });
  } catch (error) {
    console.error('Join group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's groups
// @route   GET /api/groups/my-groups
// @access  Private
const getMyGroups = async (req, res) => {
  try {
    const groups = await Group.find({
      'members.user': req.user._id
    })
    .populate('owner', 'name email')
    .populate('members.user', 'name email')
    .sort({ createdAt: -1 });

    const formattedGroups = groups.map(group => ({
      id: group._id,
      name: group.name,
      currency: group.currency,
      taxRate: group.taxRate,
      inviteKey: group.inviteKey,
      owner: group.owner,
      members: group.members,
      userRole: group.members.find(member => 
        member.user._id.toString() === req.user._id.toString()
      )?.role || 'Viewer',
      memberCount: group.members.length,
      createdAt: group.createdAt
    }));

    res.json({
      groups: formattedGroups
    });
  } catch (error) {
    console.error('Get my groups error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update member role
// @route   PUT /api/groups/:groupId/members/:userId/role
// @access  Private (Owner only)
const updateMemberRole = async (req, res) => {
  try {
    const { role } = req.body;
    const { groupId, userId } = req.params;

    // Validate role
    if (!['Editor', 'Viewer'].includes(role)) {
      return res.status(400).json({ 
        message: 'Invalid role. Must be Editor or Viewer' 
      });
    }

    // Find member and update role
    const group = await Group.findById(groupId);
    const member = group.members.find(m => m.user.toString() === userId);

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    // Don't allow changing owner's role
    if (member.role === 'Owner') {
      return res.status(400).json({ 
        message: 'Cannot change owner\'s role' 
      });
    }

    member.role = role;
    await group.save();

    res.json({ 
      message: 'Member role updated successfully',
      member: {
        userId,
        role
      }
    });
  } catch (error) {
    console.error('Update member role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Remove member from group
// @route   DELETE /api/groups/:groupId/members/:userId
// @access  Private (Owner only)
const removeMember = async (req, res) => {
  try {
    const { groupId, userId } = req.params;
    
    // Find member
    const group = await Group.findById(groupId);
    const member = group.members.find(m => m.user.toString() === userId);

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    // Don't allow removing owner
    if (member.role === 'Owner') {
      return res.status(400).json({ 
        message: 'Cannot remove group owner' 
      });
    }

    // Remove member
    group.members = group.members.filter(m => m.user.toString() !== userId);
    await group.save();

    res.json({ 
      message: 'Member removed successfully' 
    });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update group settings
// @route   PUT /api/groups/:groupId
// @access  Private (Owner only)
const updateGroup = async (req, res) => {
  try {
    const { name, currency, taxRate } = req.body;
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    
    if (name) group.name = name;
    if (currency) group.currency = currency;
    if (taxRate !== undefined) group.taxRate = taxRate;

    await group.save();

    res.json({
      message: 'Group updated successfully',
      group: {
        id: group._id,
        name: group.name,
        currency: group.currency,
        taxRate: group.taxRate
      }
    });
  } catch (error) {
    console.error('Update group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Regenerate group invite key
// @route   POST /api/groups/:groupId/regenerate-key
// @access  Private (Owner only)
const regenerateInviteKey = async (req, res) => {
  try {
    const { groupId } = req.params;
    
    const group = await Group.findById(groupId);
    
    // Generate new invite key
    let inviteKey;
    let isUnique = false;
    
    while (!isUnique) {
      inviteKey = Math.random().toString(36).substring(2, 10).toUpperCase();
      const existingGroup = await Group.findOne({ inviteKey });
      if (!existingGroup) {
        isUnique = true;
      }
    }
    
    group.inviteKey = inviteKey;
    await group.save();

    res.json({
      message: 'Invite key regenerated successfully',
      inviteKey: group.inviteKey
    });
  } catch (error) {
    console.error('Regenerate invite key error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete group
// @route   DELETE /api/groups/:groupId
// @access  Private (Owner only)
const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    
    const group = await Group.findById(groupId);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    // Check if user is the owner
    if (group.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the group owner can delete the group' });
    }
    
    // Delete the group
    await Group.findByIdAndDelete(groupId);
    
    res.json({
      message: 'Group deleted successfully'
    });
  } catch (error) {
    console.error('Delete group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Leave group
// @route   POST /api/groups/:id/leave
// @access  Private
const leaveGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.user.id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is a member of the group
    const memberIndex = group.members.findIndex(member => 
      member.user.toString() === userId
    );

    if (memberIndex === -1) {
      return res.status(400).json({ error: 'You are not a member of this group' });
    }

    const member = group.members[memberIndex];

    // Check if user is the owner
    if (member.role === 'Owner') {
      return res.status(400).json({ error: 'Group owners cannot leave the group. Transfer ownership or delete the group instead.' });
    }

    // Remove the member from the group
    group.members.splice(memberIndex, 1);
    await group.save();

    res.json({ message: 'Successfully left the group' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

module.exports = {
  createGroup,
  joinGroup,
  getMyGroups,
  updateMemberRole,
  removeMember,
  updateGroup,
  regenerateInviteKey,
  deleteGroup,
  leaveGroup
};
