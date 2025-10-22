const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Budget name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: [true, 'Group is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  limit: {
    type: Number,
    required: [true, 'Limit is required'],
    min: [0, 'Limit cannot be negative']
  },
  period: {
    type: String,
    required: [true, 'Period is required'],
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
    default: 'monthly'
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    default: Date.now
  },
  endDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notifications: {
    enabled: {
      type: Boolean,
      default: true
    },
    thresholds: [{
      percentage: {
        type: Number,
        min: [0, 'Threshold percentage cannot be negative'],
        max: [100, 'Threshold percentage cannot exceed 100']
      },
      notified: {
        type: Boolean,
        default: false
      }
    }]
  },
  tags: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add indexes for common queries
budgetSchema.index({ group: 1, category: 1 });
budgetSchema.index({ group: 1, period: 1 });
budgetSchema.index({ startDate: 1 });
budgetSchema.index({ isActive: 1 });

// Virtual for current period's start and end dates
budgetSchema.virtual('currentPeriod').get(function() {
  const now = new Date();
  let start = new Date(now);
  let end = new Date(now);

  switch (this.period) {
    case 'daily':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'weekly':
      start.setDate(now.getDate() - now.getDay());
      end.setDate(start.getDate() + 6);
      break;
    case 'monthly':
      start.setDate(1);
      end.setMonth(start.getMonth() + 1);
      end.setDate(0);
      break;
    case 'quarterly':
      const quarter = Math.floor(now.getMonth() / 3);
      start.setMonth(quarter * 3, 1);
      end.setMonth(quarter * 3 + 3, 0);
      break;
    case 'yearly':
      start.setMonth(0, 1);
      end.setMonth(11, 31);
      break;
  }

  return { start, end };
});

// Virtual for spent amount (to be populated by application logic)
budgetSchema.virtual('spent').get(function() {
  return this._spent || 0;
});

budgetSchema.virtual('remaining').get(function() {
  return this.limit - this.spent;
});

budgetSchema.virtual('percentageUsed').get(function() {
  return (this.spent / this.limit) * 100;
});

budgetSchema.virtual('status').get(function() {
  const percentage = this.percentageUsed;
  if (percentage >= 100) return 'exceeded';
  if (percentage >= 90) return 'critical';
  if (percentage >= 75) return 'warning';
  return 'safe';
});

module.exports = mongoose.model('Budget', budgetSchema);