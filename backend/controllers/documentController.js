const Document = require('../models/Document');
const Group = require('../models/Group');
const { validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/documents';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|xlsx|xls|pptx|ppt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, documents, and spreadsheets are allowed.'));
    }
  }
});

// Helper function to check if user is a member of the group
const checkGroupMembership = async (groupId, userId) => {
  const group = await Group.findById(groupId);
  if (!group) {
    return { error: 'Group not found' };
  }
  const isMember = group.members.some(member => member.user.toString() === userId.toString());
  if (!isMember) {
    return { error: 'Not authorized to access this group' };
  }
  return { group };
};

// @desc    Get all documents for a group
// @route   GET /api/documents
// @access  Private
const getDocuments = async (req, res) => {
  try {
    const { groupId } = req.query;
    if (!groupId) {
      return res.status(400).json({ error: 'Group ID is required' });
    }

    const { error } = await checkGroupMembership(groupId, req.user.id);
    if (error) {
      return res.status(401).json({ error });
    }

    const documents = await Document.find({ group: groupId })
      .populate('uploadedBy', 'name email')
      .sort({ uploadedAt: -1 });

    res.json(documents);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

// @desc    Get a single document
// @route   GET /api/documents/:id
// @access  Private
const getDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('uploadedBy', 'name email');

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const { error } = await checkGroupMembership(document.group, req.user.id);
    if (error) {
      return res.status(401).json({ error });
    }

    res.json(document);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

// @desc    Upload a new document
// @route   POST /api/documents
// @access  Private
const uploadDocument = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { groupId, name, description, category, tags, isPublic } = req.body;
    
    const { error } = await checkGroupMembership(groupId, req.user.id);
    if (error) {
      return res.status(401).json({ error });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const newDocument = new Document({
      name: name || req.file.originalname,
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      group: groupId,
      uploadedBy: req.user.id,
      description,
      category,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      isPublic: isPublic === 'true'
    });

    const document = await newDocument.save();
    await document.populate('uploadedBy', 'name email');
    
    res.status(201).json(document);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

// @desc    Update a document
// @route   PUT /api/documents/:id
// @access  Private
const updateDocument = async (req, res) => {
  const { name, description, category, tags, isPublic } = req.body;

  try {
    let document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const { error } = await checkGroupMembership(document.group, req.user.id);
    if (error) {
      return res.status(401).json({ error });
    }

    // Only the uploader or group owner can edit
    if (document.uploadedBy.toString() !== req.user.id.toString()) {
      const group = await Group.findById(document.group);
      if (group.owner.toString() !== req.user.id.toString()) {
        return res.status(403).json({ error: 'Not authorized to edit this document' });
      }
    }

    document.name = name || document.name;
    document.description = description || document.description;
    document.category = category || document.category;
    document.tags = tags ? tags.split(',').map(tag => tag.trim()) : document.tags;
    document.isPublic = isPublic !== undefined ? isPublic === 'true' : document.isPublic;

    await document.save();
    res.json(document);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

// @desc    Delete a document
// @route   DELETE /api/documents/:id
// @access  Private
const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const { error } = await checkGroupMembership(document.group, req.user.id);
    if (error) {
      return res.status(401).json({ error });
    }

    // Only the uploader or group owner can delete
    if (document.uploadedBy.toString() !== req.user.id.toString()) {
      const group = await Group.findById(document.group);
      if (group.owner.toString() !== req.user.id.toString()) {
        return res.status(403).json({ error: 'Not authorized to delete this document' });
      }
    }

    // Delete the physical file
    if (fs.existsSync(document.path)) {
      fs.unlinkSync(document.path);
    }

    await document.deleteOne();
    res.json({ message: 'Document removed' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

// @desc    Download a document
// @route   GET /api/documents/:id/download
// @access  Private
const downloadDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const { error } = await checkGroupMembership(document.group, req.user.id);
    if (error) {
      return res.status(401).json({ error });
    }

    // Check if file exists
    if (!fs.existsSync(document.path)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    // Update download count
    document.downloadCount = (document.downloadCount || 0) + 1;
    await document.save();

    res.download(document.path, document.originalName);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

// @desc    Get document statistics
// @route   GET /api/documents/stats
// @access  Private
const getDocumentStats = async (req, res) => {
  try {
    const { groupId } = req.query;
    if (!groupId) {
      return res.status(400).json({ error: 'Group ID is required' });
    }

    const { error } = await checkGroupMembership(groupId, req.user.id);
    if (error) {
      return res.status(401).json({ error });
    }

    const stats = await Document.aggregate([
      { $match: { group: groupId } },
      {
        $group: {
          _id: null,
          totalDocuments: { $sum: 1 },
          totalSize: { $sum: '$size' },
          totalDownloads: { $sum: '$downloadCount' },
          publicDocuments: {
            $sum: { $cond: ['$isPublic', 1, 0] }
          }
        }
      }
    ]);

    res.json(stats[0] || {
      totalDocuments: 0,
      totalSize: 0,
      totalDownloads: 0,
      publicDocuments: 0
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

module.exports = {
  getDocuments,
  getDocument,
  uploadDocument,
  updateDocument,
  deleteDocument,
  downloadDocument,
  getDocumentStats,
  upload
};