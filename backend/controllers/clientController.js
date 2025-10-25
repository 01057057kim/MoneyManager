const Client = require('../models/Client');

// @desc    Get all clients for a group
// @route   GET /api/clients
// @access  Private
const getClients = async (req, res) => {
  try {
    const { groupId } = req.query;
    
    if (!groupId) {
      return res.status(400).json({ message: 'Group ID is required' });
    }

    const clients = await Client.find({ groupId }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: clients.length,
      clients
    });
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create new client
// @route   POST /api/clients
// @access  Private
const createClient = async (req, res) => {
  try {
    const { name, email, phone, address, company, notes, groupId } = req.body;

    // Validation
    if (!name || !email || !groupId) {
      return res.status(400).json({ message: 'Name, email, and groupId are required' });
    }

    const client = new Client({
      name,
      email,
      phone,
      address,
      company,
      notes,
      groupId,
      createdBy: req.user._id
    });

    await client.save();

    res.status(201).json({
      success: true,
      client
    });
  } catch (error) {
    console.error('Create client error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update client
// @route   PUT /api/clients/:id
// @access  Private
const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, company, notes } = req.body;

    const client = await Client.findById(id);
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Check if user has access to this client's group
    if (client.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this client' });
    }

    const updatedClient = await Client.findByIdAndUpdate(
      id,
      { name, email, phone, address, company, notes },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      client: updatedClient
    });
  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete client
// @route   DELETE /api/clients/:id
// @access  Private
const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await Client.findById(id);
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Check if user has access to this client's group
    if (client.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this client' });
    }

    await Client.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Client deleted successfully'
    });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getClients,
  createClient,
  updateClient,
  deleteClient
};
