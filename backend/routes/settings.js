const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const {
  getUserSettings,
  updateUserProfile,
  updatePassword,
  sendEmailVerification,
  verifyEmailCode,
  send2FAVerification,
  verify2FACode,
  disable2FA,
  updateNotificationSettings,
  updateAppearanceSettings,
  deleteAccount,
  getGroupSettings,
  updateGroupSettings
} = require('../controllers/settingsController');

// Profile routes
router.get('/profile', auth, getUserSettings);

router.put('/profile', [
  auth,
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').optional().isEmail().withMessage('Please provide a valid email'),
  body('phone').optional().trim(),
  body('address').optional().trim(),
  body('company').optional().trim()
], updateUserProfile);

router.put('/password', [
  auth,
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], updatePassword);

// Email verification routes
router.post('/email/send-verification', auth, sendEmailVerification);

router.post('/email/verify', [
  auth,
  body('code').isLength({ min: 6, max: 6 }).withMessage('Verification code must be 6 digits')
], verifyEmailCode);

// 2FA routes
router.post('/2fa/send-verification', auth, send2FAVerification);

router.post('/2fa/verify', [
  auth,
  body('code').isLength({ min: 6, max: 6 }).withMessage('Verification code must be 6 digits')
], verify2FACode);

router.post('/2fa/disable', [
  auth,
  body('password').notEmpty().withMessage('Password is required')
], disable2FA);

// Notification settings
router.put('/notifications', [
  auth,
  body('emailNotifications').optional().isBoolean().withMessage('emailNotifications must be a boolean'),
  body('budgetAlerts').optional().isBoolean().withMessage('budgetAlerts must be a boolean'),
  body('taskReminders').optional().isBoolean().withMessage('taskReminders must be a boolean'),
  body('weeklyReports').optional().isBoolean().withMessage('weeklyReports must be a boolean'),
  body('monthlyReports').optional().isBoolean().withMessage('monthlyReports must be a boolean')
], updateNotificationSettings);

// Appearance settings
router.put('/appearance', [
  auth,
  body('theme').optional().isIn(['dark', 'light', 'auto']).withMessage('Theme must be dark, light, or auto'),
  body('language').optional().isIn(['en', 'es', 'fr', 'de']).withMessage('Invalid language'),
  body('dateFormat').optional().isIn(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']).withMessage('Invalid date format'),
  body('timezone').optional().isString().withMessage('Timezone must be a string')
], updateAppearanceSettings);

// Account management
router.delete('/account', [
  auth,
  body('password').notEmpty().withMessage('Password is required')
], deleteAccount);

// Group settings
router.get('/group/:groupId', auth, getGroupSettings);

router.put('/group/:groupId', [
  auth,
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Group name must be at least 2 characters'),
  body('currency').optional().isIn(['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD']).withMessage('Invalid currency'),
  body('taxRate').optional().isFloat({ min: 0, max: 100 }).withMessage('Tax rate must be between 0 and 100'),
  body('description').optional().trim()
], updateGroupSettings);

module.exports = router;
