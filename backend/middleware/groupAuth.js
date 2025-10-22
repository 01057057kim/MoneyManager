const Group = require('../models/Group');

// Middleware to check if user has required role in group
const checkGroupRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const groupId = req.params.groupId || req.body.groupId;
      
      if (!groupId) {
        return res.status(400).json({ message: 'Group ID is required' });
      }

      const group = await Group.findById(groupId);
      
      if (!group) {
        return res.status(404).json({ message: 'Group not found' });
      }

      const member = group.members.find(
        member => member.user.toString() === req.user._id.toString()
      );

      if (!member) {
        return res.status(403).json({ message: 'Not a member of this group' });
      }

      if (!allowedRoles.includes(member.role)) {
        return res.status(403).json({ 
          message: `This action requires one of these roles: ${allowedRoles.join(', ')}` 
        });
      }

      // Add group and user's role to request object
      req.group = group;
      req.userRole = member.role;

      next();
    } catch (error) {
      console.error('Group auth error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
};

// Middleware to attach group context if available
const attachGroupContext = async (req, res, next) => {
  try {
    const groupId = req.params.groupId || req.body.groupId;
    
    if (groupId) {
      const group = await Group.findById(groupId);
      
      if (group) {
        const member = group.members.find(
          member => member.user.toString() === req.user._id.toString()
        );

        if (member) {
          req.group = group;
          req.userRole = member.role;
        }
      }
    }

    next();
  } catch (error) {
    console.error('Attach group context error:', error);
    next();
  }
};

module.exports = {
  checkGroupRole,
  attachGroupContext
};