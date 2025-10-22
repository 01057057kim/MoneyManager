const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true
  },
  company: {
    type: String,
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: [true, 'Group is required']
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
  },
  tags: [{
    type: String,
    trim: true
  }],
  customFields: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    value: {
      type: String,
      trim: true
    }
  }],
  contacts: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    role: String,
    email: String,
    phone: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  documents: [{
    name: String,
    url: String,
    type: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for common queries
clientSchema.index({ group: 1, status: 1 });
clientSchema.index({ group: 1, name: 1 });
clientSchema.index({ email: 1 });
clientSchema.index({ 'contacts.email': 1 });

// Virtual for total revenue (to be populated by application logic)
clientSchema.virtual('totalRevenue').get(function() {
  return this._totalRevenue || 0;
});

// Virtual for outstanding balance (to be populated by application logic)
clientSchema.virtual('outstandingBalance').get(function() {
  return this._outstandingBalance || 0;
});

// Virtual for last transaction date (to be populated by application logic)
clientSchema.virtual('lastTransactionDate').get(function() {
  return this._lastTransactionDate;
});

// Virtual for active projects count (to be populated by application logic)
clientSchema.virtual('activeProjectsCount').get(function() {
  return this._activeProjectsCount || 0;
});

// Method to get primary contact
clientSchema.methods.getPrimaryContact = function() {
  return this.contacts.find(contact => contact.isPrimary) || this.contacts[0];
};

// Method to validate email
clientSchema.methods.hasValidEmail = function() {
  return this.email && /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(this.email);
};

module.exports = mongoose.model('Client', clientSchema);