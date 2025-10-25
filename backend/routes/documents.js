const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const {
  getDocuments,
  getDocument,
  uploadDocument,
  updateDocument,
  deleteDocument,
  downloadDocument,
  getDocumentStats,
  upload
} = require('../controllers/documentController');

// @route   GET /api/documents
// @desc    Get all documents for a group
// @access  Private
router.get('/', auth, getDocuments);

// @route   GET /api/documents/stats
// @desc    Get document statistics
// @access  Private
router.get('/stats', auth, getDocumentStats);

// @route   GET /api/documents/:id
// @desc    Get a single document
// @access  Private
router.get('/:id', auth, getDocument);

// @route   POST /api/documents
// @desc    Upload a new document
// @access  Private
router.post('/', [
  auth,
  upload.single('file'),
  body('groupId').notEmpty().withMessage('Group ID is required'),
  body('name').optional().trim(),
  body('description').optional().trim(),
  body('category').notEmpty().withMessage('Category is required'),
  body('tags').optional(),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean')
], uploadDocument);

// @route   PUT /api/documents/:id
// @desc    Update a document
// @access  Private
router.put('/:id', [
  auth,
  body('name').optional().trim(),
  body('description').optional().trim(),
  body('category').optional().trim(),
  body('tags').optional(),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean')
], updateDocument);

// @route   DELETE /api/documents/:id
// @desc    Delete a document
// @access  Private
router.delete('/:id', auth, deleteDocument);

// @route   GET /api/documents/:id/download
// @desc    Download a document
// @access  Private
router.get('/:id/download', auth, downloadDocument);

module.exports = router;
