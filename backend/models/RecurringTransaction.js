const mongoose = require('mongoose');

const recurringTransactionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
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
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: [true, 'Group is required']
  },
  frequency: {
    type: String,
    required: [true, 'Frequency is required'],
    enum: ['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date
  },
  lastProcessed: {
    type: Date
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
  isActive: {
    type: Boolean,
    default: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
  }
}, {
  timestamps: true
});

// Add indexes for efficient querying
recurringTransactionSchema.index({ group: 1, frequency: 1 });
recurringTransactionSchema.index({ lastProcessed: 1 });
recurringTransactionSchema.index({ isActive: 1 });

// Virtual for next occurrence date
recurringTransactionSchema.virtual('nextOccurrence').get(function() {
  if (!this.isActive || (this.endDate && this.endDate < new Date())) {
    return null;
  }

  const lastDate = this.lastProcessed || this.startDate;
  const now = new Date();
  let nextDate = new Date(lastDate);

  switch (this.frequency) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'biweekly':
      nextDate.setDate(nextDate.getDate() + 14);
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case 'quarterly':
      nextDate.setMonth(nextDate.getMonth() + 3);
      break;
    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
  }

  return nextDate < now ? now : nextDate;
});

// Method to check if transaction is due
recurringTransactionSchema.methods.isDue = function() {
  const nextOccurrence = this.nextOccurrence;
  if (!nextOccurrence) return false;
  
  const now = new Date();
  return nextOccurrence <= now;
};

// Method to validate total shares
recurringTransactionSchema.methods.validateShares = function() {
  const total = this.participants.reduce((sum, p) => sum + p.share, 0);
  return Math.abs(total - this.amount) < 0.01;
};

module.exports = mongoose.model('RecurringTransaction', recurringTransactionSchema);