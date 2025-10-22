const express = require('express');
const { body } = require('express-validator');
const { 
  createGroup, 
  joinGroup, 
  getMyGroups,
  updateMemberRole,
  removeMember,
  updateGroup,
  regenerateInviteKey
} = require('../controllers/groupController');
const auth = require('../middleware/auth');
const { checkGroupRole } = require('../middleware/groupAuth');

const router = express.Router();

// @route   POST /api/groups/create
// @desc    Create group
// @access  Private
router.post('/create', auth, [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Group name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Group name must be between 2 and 100 characters'),
  body('currency')
    .optional()
    .isIn(['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'INR', 'BRL', 'MXN', 'CHF', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK', 'HUF', 'RUB', 'CNY', 'KRW', 'SGD', 'HKD', 'NZD', 'ZAR', 'TRY', 'ILS', 'AED', 'SAR', 'QAR', 'KWD', 'BHD', 'OMR', 'JOD', 'LBP', 'EGP', 'MAD', 'TND', 'DZD', 'LYD', 'SDG', 'ETB', 'KES', 'UGX', 'TZS', 'ZMW', 'BWP', 'SZL', 'LSL', 'NAD', 'AOA', 'MZN', 'MWK', 'ZWL', 'GHS', 'NGN', 'XOF', 'XAF', 'CDF', 'RWF', 'BIF', 'DJF', 'KMF', 'MGA', 'SCR', 'MUR', 'SLL', 'GMD', 'GNF', 'LRD', 'CVE', 'STN', 'XPF', 'TOP', 'WST', 'VUV', 'SBD', 'PGK', 'FJD', 'NPR', 'BTN', 'LKR', 'MVR', 'AFN', 'PKR', 'BDT', 'MMK', 'LAK', 'KHR', 'VND', 'THB', 'MYR', 'PHP', 'IDR', 'BND', 'MMK', 'KZT', 'UZS', 'KGS', 'TJS', 'TMT', 'AZN', 'GEL', 'AMD', 'BYN', 'MDL', 'UAH', 'BGN', 'RON', 'HRK', 'RSD', 'MKD', 'ALL', 'BAM', 'MNT', 'KPW', 'MOP', 'TWD', 'HNL', 'GTQ', 'BZD', 'SVC', 'NIO', 'CRC', 'PAB', 'PEN', 'BOB', 'CLP', 'COP', 'ARS', 'UYU', 'PYG', 'BRL', 'VES', 'GYD', 'SRD', 'TTD', 'BBD', 'JMD', 'XCD', 'AWG', 'ANG', 'BMD', 'KYD', 'FKP', 'SHP', 'GBP', 'EUR', 'USD'])
    .withMessage('Invalid currency'),
  body('taxRate')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Tax rate must be between 0 and 100')
], createGroup);

// @route   POST /api/groups/join
// @desc    Join group
// @access  Private
router.post('/join', auth, [
  body('inviteKey')
    .trim()
    .notEmpty()
    .withMessage('Invite key is required')
    .isLength({ min: 6, max: 10 })
    .withMessage('Invalid invite key format')
], joinGroup);

// Group management (Owner only)
router.put('/:groupId', 
  auth, 
  checkGroupRole(['Owner']), 
  [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Group name must be between 2 and 100 characters'),
    body('currency')
      .optional()
      .isIn(['USD', 'EUR', 'GBP'])  // Simplified currency list for example
      .withMessage('Invalid currency'),
    body('taxRate')
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage('Tax rate must be between 0 and 100')
  ],
  updateGroup
);

router.post('/:groupId/regenerate-key', 
  auth, 
  checkGroupRole(['Owner']), 
  regenerateInviteKey
);

// Member management (Owner only)
router.put('/:groupId/members/:userId/role', 
  auth, 
  checkGroupRole(['Owner']), 
  [
    body('role')
      .trim()
      .notEmpty()
      .withMessage('Role is required')
      .isIn(['Editor', 'Viewer'])
      .withMessage('Invalid role. Must be Editor or Viewer')
  ],
  updateMemberRole
);

router.delete('/:groupId/members/:userId', 
  auth, 
  checkGroupRole(['Owner']), 
  removeMember
);

// @route   GET /api/groups/my-groups
// @desc    Get user's groups
// @access  Private
router.get('/my-groups', auth, getMyGroups);

module.exports = router;
