const express = require('express');
const router = express.Router();
const {
  getClients,
  createClient,
  updateClient,
  deleteClient
} = require('../controllers/clientController');
const auth = require('../middleware/auth');

// All routes are protected
router.use(auth);

// @route   GET /api/clients
// @desc    Get all clients for a group
// @access  Private
router.get('/', getClients);

// @route   POST /api/clients
// @desc    Create new client
// @access  Private
router.post('/', createClient);

// @route   PUT /api/clients/:id
// @desc    Update client
// @access  Private
router.put('/:id', updateClient);

// @route   DELETE /api/clients/:id
// @desc    Delete client
// @access  Private
router.delete('/:id', deleteClient);

module.exports = router;