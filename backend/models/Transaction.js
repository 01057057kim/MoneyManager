const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [100, 'Description cannot exceed 100 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  type: {
    type: String,
    required: [true, 'Transaction type is required'],
    enum: ['income', 'expense'],
    default: 'expense'
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: [true, 'Group is required']
  },
  payer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Payer is required']
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    share: {
      type: Number,
      required: true,
      min: [0, 'Share cannot be negative']
    }
  }],
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  receipt: {
    url: String,
    publicId: String
  },
  recurringId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RecurringTransaction'
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'completed'
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Add indexes for common queries
transactionSchema.index({ group: 1, date: -1 });
transactionSchema.index({ group: 1, type: 1 });
transactionSchema.index({ group: 1, category: 1 });
transactionSchema.index({ payer: 1 });
transactionSchema.index({ 'participants.user': 1 });

// Virtual for formatted date
transactionSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString();
});

// Virtual for total participant shares
transactionSchema.virtual('totalShares').get(function() {
  return this.participants.reduce((sum, participant) => sum + participant.share, 0);
});

// Method to check if shares add up to amount
transactionSchema.methods.validateShares = function() {
  const total = this.totalShares;
  return Math.abs(total - this.amount) < 0.01; // Allow for small floating point differences
};

module.exports = mongoose.model('Transaction', transactionSchema);