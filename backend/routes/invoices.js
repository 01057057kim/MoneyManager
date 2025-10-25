const express = require('express');
const router = express.Router();
const {
  getInvoices,
  createInvoice,
  updateInvoice,
  markAsPaid,
  deleteInvoice
} = require('../controllers/invoiceController');
const auth = require('../middleware/auth');

// All routes are protected
router.use(auth);

// @route   GET /api/invoices
// @desc    Get all invoices for a group
// @access  Private
router.get('/', getInvoices);

// @route   POST /api/invoices
// @desc    Create new invoice
// @access  Private
router.post('/', createInvoice);

// @route   PUT /api/invoices/:id
// @desc    Update invoice
// @access  Private
router.put('/:id', updateInvoice);

// @route   PUT /api/invoices/:id/mark-paid
// @desc    Mark invoice as paid
// @access  Private
router.put('/:id/mark-paid', markAsPaid);

// @route   DELETE /api/invoices/:id
// @desc    Delete invoice
// @access  Private
router.delete('/:id', deleteInvoice);

module.exports = router;
