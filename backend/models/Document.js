const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  originalName: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Virtual for file type
DocumentSchema.virtual('fileType').get(function() {
  const ext = this.originalName.split('.').pop().toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
    return 'image';
  } else if (['pdf'].includes(ext)) {
    return 'pdf';
  } else if (['doc', 'docx', 'txt'].includes(ext)) {
    return 'text';
  } else if (['xlsx', 'xls', 'csv'].includes(ext)) {
    return 'spreadsheet';
  } else if (['pptx', 'ppt'].includes(ext)) {
    return 'presentation';
  } else {
    return 'other';
  }
});

// Virtual for formatted file size
DocumentSchema.virtual('formattedSize').get(function() {
  const bytes = this.size;
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// Index for better performance
DocumentSchema.index({ group: 1, uploadedAt: -1 });
DocumentSchema.index({ uploadedBy: 1 });
DocumentSchema.index({ category: 1 });
DocumentSchema.index({ tags: 1 });

module.exports = mongoose.model('Document', DocumentSchema);
