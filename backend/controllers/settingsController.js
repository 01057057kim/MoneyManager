const User = require('../models/User');
const Group = require('../models/Group');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can use other services like SendGrid, Mailgun, etc.
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// @desc    Get user settings
// @route   GET /api/settings/profile
// @access  Private
exports.getUserSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/settings/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, phone, address, company } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if email is being changed
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already exists' });
      }
      user.email = email;
    }

    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.address = address || user.address;
    user.company = company || user.company;

    await user.save();
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

// @desc    Update user password
// @route   PUT /api/settings/password
// @access  Private
exports.updatePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

// @desc    Send email verification code
// @route   POST /api/settings/email/send-verification
// @access  Private
exports.sendEmailVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate verification code
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store verification code in user document
    user.emailVerificationCode = verificationCode;
    user.emailVerificationExpires = expiresAt;
    await user.save();

    // Send verification email
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: user.email,
      subject: 'Email Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Email Verification</h2>
          <p>Hello ${user.name},</p>
          <p>You have requested to verify your email address for your account.</p>
          <p>Your verification code is:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${verificationCode}</h1>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this verification, please ignore this email.</p>
          <p>Best regards,<br>Your Finance Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'Email verification code sent' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Failed to send email verification' });
  }
};

// @desc    Verify email verification code
// @route   POST /api/settings/email/verify
// @access  Private
exports.verifyEmailCode = async (req, res) => {
  const { code } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.emailVerificationCode || !user.emailVerificationExpires) {
      return res.status(400).json({ error: 'No verification code found. Please request a new code.' });
    }

    if (new Date() > user.emailVerificationExpires) {
      return res.status(400).json({ error: 'Verification code has expired. Please request a new code.' });
    }

    if (user.emailVerificationCode !== code) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    // Mark email as verified
    user.emailVerified = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationExpires = undefined;

    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

// @desc    Send 2FA verification email
// @route   POST /api/settings/2fa/send-verification
// @access  Private
exports.send2FAVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate verification code
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store verification code in user document
    user.twoFactorCode = verificationCode;
    user.twoFactorCodeExpires = expiresAt;
    await user.save();

    // Send verification email
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: user.email,
      subject: 'Two-Factor Authentication Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Two-Factor Authentication</h2>
          <p>Hello ${user.name},</p>
          <p>You have requested to enable Two-Factor Authentication for your account.</p>
          <p>Your verification code is:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${verificationCode}</h1>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <p>Best regards,<br>Your Finance Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'Verification code sent to your email' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Failed to send verification email' });
  }
};

// @desc    Verify 2FA code and enable 2FA
// @route   POST /api/settings/2fa/verify
// @access  Private
exports.verify2FACode = async (req, res) => {
  const { code } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.twoFactorCode || !user.twoFactorCodeExpires) {
      return res.status(400).json({ error: 'No verification code found. Please request a new code.' });
    }

    if (new Date() > user.twoFactorCodeExpires) {
      return res.status(400).json({ error: 'Verification code has expired. Please request a new code.' });
    }

    if (user.twoFactorCode !== code) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    // Enable 2FA
    user.twoFactorEnabled = true;
    user.twoFactorCode = undefined;
    user.twoFactorCodeExpires = undefined;

    await user.save();

    res.json({ message: 'Two-Factor Authentication enabled successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

// @desc    Disable 2FA
// @route   POST /api/settings/2fa/disable
// @access  Private
exports.disable2FA = async (req, res) => {
  const { password } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Password is incorrect' });
    }

    // Disable 2FA
    user.twoFactorEnabled = false;
    user.twoFactorCode = undefined;
    user.twoFactorCodeExpires = undefined;

    await user.save();

    res.json({ message: 'Two-Factor Authentication disabled successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

// @desc    Update notification settings
// @route   PUT /api/settings/notifications
// @access  Private
exports.updateNotificationSettings = async (req, res) => {
  const { emailNotifications, budgetAlerts, taskReminders, weeklyReports, monthlyReports } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.notificationSettings = {
      emailNotifications: emailNotifications !== undefined ? emailNotifications : user.notificationSettings?.emailNotifications || true,
      budgetAlerts: budgetAlerts !== undefined ? budgetAlerts : user.notificationSettings?.budgetAlerts || true,
      taskReminders: taskReminders !== undefined ? taskReminders : user.notificationSettings?.taskReminders || true,
      weeklyReports: weeklyReports !== undefined ? weeklyReports : user.notificationSettings?.weeklyReports || true,
      monthlyReports: monthlyReports !== undefined ? monthlyReports : user.notificationSettings?.monthlyReports || true
    };

    await user.save();
    res.json(user.notificationSettings);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

// @desc    Update appearance settings
// @route   PUT /api/settings/appearance
// @access  Private
exports.updateAppearanceSettings = async (req, res) => {
  const { theme, language, dateFormat, timezone } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.appearanceSettings = {
      theme: theme || user.appearanceSettings?.theme || 'dark',
      language: language || user.appearanceSettings?.language || 'en',
      dateFormat: dateFormat || user.appearanceSettings?.dateFormat || 'MM/DD/YYYY',
      timezone: timezone || user.appearanceSettings?.timezone || 'UTC'
    };

    await user.save();
    res.json(user.appearanceSettings);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

// @desc    Delete user account
// @route   DELETE /api/settings/account
// @access  Private
exports.deleteAccount = async (req, res) => {
  const { password } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Password is incorrect' });
    }

    // Delete user account
    await User.findByIdAndDelete(req.user.id);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

// @desc    Get group settings
// @route   GET /api/settings/group/:groupId
// @access  Private
exports.getGroupSettings = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is a member
    const isMember = group.members.some(member => member.user._id.toString() === req.user.id.toString());
    if (!isMember) {
      return res.status(401).json({ error: 'Not authorized to access this group' });
    }

    res.json(group);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

// @desc    Update group settings
// @route   PUT /api/settings/group/:groupId
// @access  Private
exports.updateGroupSettings = async (req, res) => {
  const { name, currency, taxRate, description } = req.body;

  try {
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is the owner
    if (group.owner.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this group' });
    }

    group.name = name || group.name;
    group.currency = currency || group.currency;
    group.taxRate = taxRate !== undefined ? taxRate : group.taxRate;
    group.description = description || group.description;

    await group.save();
    res.json(group);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server Error' });
  }
};
