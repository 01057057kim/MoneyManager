const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: [true, 'Group is required']
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  dueDate: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  linkedRecords: {
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction'
    },
    recurringTransaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RecurringTransaction'
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client'
    }
  },
  reminders: [{
    date: {
      type: Date,
      required: true
    },
    sent: {
      type: Boolean,
      default: false
    }
  }],
  checklist: [{
    item: {
      type: String,
      required: true,
      trim: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date,
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  attachments: [{
    name: String,
    url: String,
    type: String,
    size: Number,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for common queries
taskSchema.index({ group: 1, status: 1 });
taskSchema.index({ group: 1, assignee: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ 'linkedRecords.transaction': 1 });
taskSchema.index({ 'linkedRecords.recurringTransaction': 1 });
taskSchema.index({ 'linkedRecords.client': 1 });

// Virtual for overdue status
taskSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate || this.status === 'completed' || this.status === 'cancelled') {
    return false;
  }
  return new Date() > this.dueDate;
});

// Virtual for progress
taskSchema.virtual('progress').get(function() {
  if (!this.checklist || this.checklist.length === 0) {
    return this.status === 'completed' ? 100 : 0;
  }
  
  const completed = this.checklist.filter(item => item.completed).length;
  return Math.round((completed / this.checklist.length) * 100);
});

// Method to check if user can edit task
taskSchema.methods.canEdit = function(userId) {
  return this.creator.toString() === userId.toString() || 
         this.assignee?.toString() === userId.toString();
};

module.exports = mongoose.model('Task', taskSchema);