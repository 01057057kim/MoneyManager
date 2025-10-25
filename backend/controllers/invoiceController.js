const Invoice = require('../models/Invoice');

// @desc    Get all invoices for a group
// @route   GET /api/invoices
// @access  Private
const getInvoices = async (req, res) => {
  try {
    const { groupId } = req.query;
    
    if (!groupId) {
      return res.status(400).json({ message: 'Group ID is required' });
    }

    const invoices = await Invoice.find({ groupId })
      .populate('clientId', 'name email')
      .populate('projectId', 'name')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: invoices.length,
      invoices
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create new invoice
// @route   POST /api/invoices
// @access  Private
const createInvoice = async (req, res) => {
  try {
    const { 
      invoiceNumber, 
      clientId, 
      projectId, 
      status, 
      issueDate, 
      dueDate, 
      paidDate, 
      subtotal, 
      taxRate, 
      taxAmount, 
      total, 
      notes, 
      items, 
      groupId 
    } = req.body;

    // Validation
    if (!invoiceNumber || !clientId || !groupId) {
      return res.status(400).json({ message: 'Invoice number, clientId, and groupId are required' });
    }

    // Check if invoice number already exists
    const existingInvoice = await Invoice.findOne({ invoiceNumber });
    if (existingInvoice) {
      return res.status(400).json({ message: 'Invoice number already exists' });
    }

    // Validate and clean items
    const validItems = (items || []).filter(item => 
      item && 
      item.description && 
      item.description.trim() && 
      typeof item.quantity === 'number' && 
      typeof item.rate === 'number'
    ).map(item => ({
      description: item.description.trim(),
      quantity: Math.max(0, item.quantity || 0),
      rate: Math.max(0, item.rate || 0),
      amount: Math.max(0, (item.quantity || 0) * (item.rate || 0))
    }));

    const invoice = new Invoice({
      invoiceNumber,
      clientId,
      projectId,
      status: status || 'draft',
      issueDate: issueDate ? new Date(issueDate) : new Date(),
      dueDate: dueDate ? new Date(dueDate) : new Date(),
      paidDate: paidDate ? new Date(paidDate) : undefined,
      subtotal: subtotal || 0,
      taxRate: taxRate || 0,
      taxAmount: taxAmount || 0,
      total: total || 0,
      notes,
      items: validItems,
      groupId,
      createdBy: req.user._id
    });

    await invoice.save();

    // Populate client and project info
    await invoice.populate('clientId', 'name email');
    await invoice.populate('projectId', 'name');

    res.status(201).json({
      success: true,
      invoice
    });
  } catch (error) {
    console.error('Create invoice error:', error);
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Invoice number already exists' });
    }
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation error', errors });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update invoice
// @route   PUT /api/invoices/:id
// @access  Private
const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const invoice = await Invoice.findById(id);
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Check if user has access to this invoice's group
    if (invoice.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this invoice' });
    }

    const updatedInvoice = await Invoice.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('clientId', 'name email')
     .populate('projectId', 'name');

    res.json({
      success: true,
      invoice: updatedInvoice
    });
  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark invoice as paid
// @route   PUT /api/invoices/:id/mark-paid
// @access  Private
const markAsPaid = async (req, res) => {
  try {
    const { id } = req.params;
    const { paidDate } = req.body;

    const invoice = await Invoice.findById(id);
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Check if user has access to this invoice's group
    if (invoice.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this invoice' });
    }

    const updatedInvoice = await Invoice.findByIdAndUpdate(
      id,
      { 
        status: 'paid',
        paidDate: paidDate || new Date()
      },
      { new: true, runValidators: true }
    ).populate('clientId', 'name email')
     .populate('projectId', 'name');

    res.json({
      success: true,
      invoice: updatedInvoice
    });
  } catch (error) {
    console.error('Mark invoice as paid error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete invoice
// @route   DELETE /api/invoices/:id
// @access  Private
const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findById(id);
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Check if user has access to this invoice's group
    if (invoice.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this invoice' });
    }

    await Invoice.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Invoice deleted successfully'
    });
  } catch (error) {
    console.error('Delete invoice error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getInvoices,
  createInvoice,
  updateInvoice,
  markAsPaid,
  deleteInvoice
};
