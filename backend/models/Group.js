const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Group name is required'],
    trim: true,
    maxlength: [100, 'Group name cannot exceed 100 characters']
  },
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'INR', 'BRL', 'MXN', 'CHF', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK', 'HUF', 'RUB', 'CNY', 'KRW', 'SGD', 'HKD', 'NZD', 'ZAR', 'TRY', 'ILS', 'AED', 'SAR', 'QAR', 'KWD', 'BHD', 'OMR', 'JOD', 'LBP', 'EGP', 'MAD', 'TND', 'DZD', 'LYD', 'SDG', 'ETB', 'KES', 'UGX', 'TZS', 'ZMW', 'BWP', 'SZL', 'LSL', 'NAD', 'AOA', 'MZN', 'MWK', 'ZWL', 'GHS', 'NGN', 'XOF', 'XAF', 'CDF', 'RWF', 'BIF', 'DJF', 'KMF', 'MGA', 'SCR', 'MUR', 'SLL', 'GMD', 'GNF', 'LRD', 'CVE', 'STN', 'XPF', 'TOP', 'WST', 'VUV', 'SBD', 'PGK', 'FJD', 'NPR', 'BTN', 'LKR', 'MVR', 'AFN', 'PKR', 'BDT', 'MMK', 'LAK', 'KHR', 'VND', 'THB', 'MYR', 'PHP', 'IDR', 'BND', 'MMK', 'KZT', 'UZS', 'KGS', 'TJS', 'TMT', 'AZN', 'GEL', 'AMD', 'BYN', 'MDL', 'UAH', 'BGN', 'RON', 'HRK', 'RSD', 'MKD', 'ALL', 'BAM', 'MNT', 'KPW', 'MOP', 'TWD', 'HNL', 'GTQ', 'BZD', 'SVC', 'NIO', 'CRC', 'PAB', 'PEN', 'BOB', 'CLP', 'COP', 'ARS', 'UYU', 'PYG', 'BRL', 'VES', 'GYD', 'SRD', 'TTD', 'BBD', 'JMD', 'XCD', 'AWG', 'ANG', 'BMD', 'KYD', 'FKP', 'SHP', 'GBP', 'EUR', 'USD']
  },
  taxRate: {
    type: Number,
    default: 0,
    min: [0, 'Tax rate cannot be negative'],
    max: [100, 'Tax rate cannot exceed 100%']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['Owner', 'Editor', 'Viewer'],
      default: 'Viewer'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  inviteKey: {
    type: String,
    unique: true,
    required: true
  }
}, {
  timestamps: true
});

// Generate unique invite key before saving
groupSchema.pre('save', async function(next) {
  if (!this.inviteKey) {
    let inviteKey;
    let isUnique = false;
    
    while (!isUnique) {
      // Generate 8-character alphanumeric key
      inviteKey = Math.random().toString(36).substring(2, 10).toUpperCase();
      
      // Check if key already exists
      const existingGroup = await this.constructor.findOne({ inviteKey });
      if (!existingGroup) {
        isUnique = true;
      }
    }
    
    this.inviteKey = inviteKey;
  }
  
  // Add owner as first member if not already added
  if (this.members.length === 0) {
    this.members.push({
      user: this.owner,
      role: 'Owner'
    });
  }
  
  next();
});

module.exports = mongoose.model('Group', groupSchema);
