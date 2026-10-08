const bcrypt = require('bcryptjs');
const { db } = require('../models');
const User = db.User;
const Session = db.Session;
const OTPLog = db.OTPLog;
const Role = db.Role;
const RolePermission = db.RolePermission;
const fs = require('fs');
const path = require('path');
const { generateToken } = require('../utils/jwt');
const {
  hashPassword, isValidEmail, isValidPassword, findUserByEmail, isValidName, generateOTP, getSettings, checkMaintenanceAccess, formatUser
} = require('../helpers/authHelpers');
const EmailDispatcher = require('../services/emailDispatcher');

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  const ip = req.ip;

  try {
    await checkMaintenanceAccess(ip);

    if (!isValidName(name) || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'User with this email already exists.' });
    }

    const otp = generateOTP();
    const expires_at = new Date(Date.now() + 10 * 60 * 1000);

    const hashedPassword = await hashPassword(password);

    await OTPLog.create({
      email: email.toLowerCase().trim(),
      otp,
      expires_at,
      verified: false,
      metadata: {
        name: name.trim(),
        password: hashedPassword
      }
    });

    if (process.env.APP_DEMO_MODE !== 'true') {
      await EmailDispatcher.dispatch(email.toLowerCase().trim(), 'registration-otp', {
        user_name: name.trim(),
        otp_code: otp
      });
    }

    return res.status(200).json({
      success: true,
      message: `Verification OTP sent successfully to ${email}`,
      demo_otp: process.env.APP_DEMO_MODE === 'true' ? otp : null
    });
  } catch (err) {
    if (err.message === 'MAINTENANCE_MODE') {
      const settings = await getSettings();
      return res.status(503).json({ success: false, message: settings.maintenance_message || 'System under maintenance', maintenance: true });
    }
    console.error('Registration request error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.verifyRegistration = async (req, res) => {
  const { email, otp } = req.body;
  const ip = req.ip;

  try {
    await checkMaintenanceAccess(ip);

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required.' });
    }

    const otpRecord = await OTPLog.findOne({
      email: email.toLowerCase().trim(),
      otp,
      verified: false,
      expires_at: { $gt: new Date() }
    }).sort({ created_at: -1 });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
    }

    const { metadata } = otpRecord;
    if (!metadata || !metadata.name || !metadata.password) {
      return res.status(400).json({ success: false, message: 'Invalid registration session. Please register again.' });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'User with this email already exists.' });
    }

    const settings = await getSettings();
    const userRole = await Role.findOne({ name: 'user' });

    const user = await User.create({
      name: metadata.name,
      email: email.toLowerCase().trim(),
      password: metadata.password,
      roleId: userRole ? userRole._id : null,
      isVerified: true,
      total_credits: settings.registration_free_credits || 0,
      caption_credits: settings.registration_free_caption_credits || 0
    });

    await otpRecord.updateOne({ verified: true });

    EmailDispatcher.dispatch(user.email, 'welcome-message', {
      user_name: user.name,
      user_email: user.email,
      login_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`
    }).catch(err => console.error('Error sending welcome email:', err));

    return res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      user: formatUser(user)
    });
  } catch (err) {
    if (err.message === 'MAINTENANCE_MODE') {
      const settings = await getSettings();
      return res.status(503).json({ success: false, message: settings.maintenance_message || 'System under maintenance', maintenance: true });
    }
    console.error('Registration verification error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid email or password.' });
    }

    await checkMaintenanceAccess(req.ip, user.roleId?.name);

    if (!user.isActive) {
      return res.status(400).json({ success: false, message: 'Your account has been deactivated.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: 'Invalid email or password.' });
    }

    await User.updateOne({ _id: user._id }, { $set: { lastLogin: new Date(), isOnline: true } });

    const token = generateToken({ id: user._id, email: user.email });

    const settings = await getSettings();

    const sessionLimit = settings?.session_limit || 10
    const activeSessions = await Session.find({
      user_id: user._id,
      status: 'active',
      device_info: req.headers['user-agent'],
    }).sort({ created_at: 1 });

    if (activeSessions.length >= sessionLimit) {
      await activeSessions[0].deleteOne();
    }

    const expires_at = new Date(Date.now() + (settings?.session_expiration_days || 7) * 24 * 60 * 60 * 1000);

    await Session.create({
      user_id: user._id,
      session_token: token,
      device_info: req.headers['user-agent'],
      ip_address: req.ip,
      agenda: 'login',
      expires_at
    });

    const roleId = user.roleId ? (user.roleId._id || user.roleId) : null;
    if (roleId) {
      const rolePerms = await RolePermission.find({ role_id: roleId })
        .populate('permission_id', 'slug')
        .lean();
      user.permissionSlugs = rolePerms
        .filter(rp => rp.permission_id)
        .map(rp => rp.permission_id.slug);
    } else {
      user.permissionSlugs = [];
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user: formatUser(user)
    });
  } catch (err) {
    if (err.message === 'MAINTENANCE_MODE') {
      const settings = await getSettings();
      return res.status(503).json({ success: false, message: settings.maintenance_message || 'System under maintenance', maintenance: true });
    }
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.logout = async (req, res) => {
  const userId = req.user._id;
  const token = req.token;

  try {
    const session = await Session.findOne({ user_id: userId, session_token: token, status: 'active' });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found or already logged out.' });
    }

    await Session.findByIdAndUpdate(session._id, { status: 'inactive' });
    await User.updateOne({ _id: userId }, { $set: { isOnline: false } });

    return res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password').populate('roleId');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const roleId = user.roleId ? (user.roleId._id || user.roleId) : null;
    if (roleId) {
      const rolePerms = await RolePermission.find({ role_id: roleId })
        .populate('permission_id', 'slug')
        .lean();
      user.permissionSlugs = rolePerms
        .filter(rp => rp.permission_id)
        .map(rp => rp.permission_id.slug);
    } else {
      user.permissionSlugs = [];
    }

    return res.status(200).json({
      success: true,
      message: 'User Profile fetched successfully.',
      user: formatUser(user)
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.updateProfile = async (req, res) => {
  const { name, email, remove_avatar } = req.body;

  try {
    if (name && !isValidName(name)) {
      return res.status(400).json({ success: false, message: 'Name must be a valid string with content.' });
    }

    const user = await User.findById(req.user._id,);
    if (!user) return res.status(404).json({ success: false, message: 'User Not Found' });

    if (email && email !== user.email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ success: false, message: 'Invalid Email format' });
      }
      const existingEmail = await User.findOne({ email, _id: { $ne: user._id } });
      if (existingEmail) {
        return res.status(409).json({ success: false, message: 'Email already registered with this role' });
      }
    }

    const deleteOldAvatar = () => {
      if (!user.avatar) return;
      const oldAvatarPath = path.join(process.cwd(), user.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        try {
          fs.unlinkSync(oldAvatarPath);
        } catch (error) {
          console.error('Error deleting old avatar', error);
        }
      }
    };

    let avatar = user.avatar;
    if (remove_avatar === 'true') {
      deleteOldAvatar();
      avatar = null;
    } else if (req.file) {
      deleteOldAvatar();
      avatar = req.file.path;
    }

    const updates = {};
    if (name) {
      updates.name = name.trim();
    }

    if (email) {
      updates.email = email;
    }

    updates.avatar = avatar;

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, { new: true, select: '-password' });
    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: formatUser(updatedUser)
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  const ip = req.ip;

  try {
    await checkMaintenanceAccess(ip);

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const otp = generateOTP();
    const expires_at = new Date(Date.now() + 10 * 60 * 1000);

    const settings = await getSettings();

    if (process.env.APP_DEMO_MODE !== 'true') {
      if (email) {
        const emailSent = await EmailDispatcher.dispatch(
          email,
          'password-reset-otp',
          {
            user_name: user.name,
            reset_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password`,
            otp_code: otp
          }
        );
        if (!emailSent.success) {
          console.error('[Request Reset OTP] Email Error:', emailSent.message);
          return res.status(500).json({ message: 'Failed to send OTP email' });
        }
      }
    }

    await OTPLog.create({ email: email, otp, expires_at, verified: false });

    return res.status(200).json({
      success: true,
      message: `OTP sent successfully to your email ${email}`,
      demo_otp: process.env.APP_DEMO_MODE === 'true' ? otp : null
    });

  } catch (error) {
    if (error.message === 'MAINTENANCE_MODE') {
      const settings = await getSettings();
      return res.status(503).json({ message: settings.maintenance_message || 'System under maintenance', maintenance: true });
    }
    console.error('Request password reset error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const ip = req.ip;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'email and OTP are required' });
    }

    await checkMaintenanceAccess(ip);

    const otpRecord = await OTPLog.findOne({
      email,
      otp,
      verified: false,
      expires_at: { $gt: new Date() },
    }).sort({ created_at: -1 });

    if (!otpRecord) return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });

    await otpRecord.updateOne({ verified: true });

    return res.status(200).json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    if (error.message === 'MAINTENANCE_MODE') {
      const settings = await getSettings();
      return res.status(503).json({ success: false, message: settings.maintenance_message || 'System under maintenance', maintenance: true });
    }
    console.error('Error verifying OTP:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const ip = req.ip;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    await checkMaintenanceAccess(ip);

    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    const otpLog = await OTPLog.findOne({ email, verified: false, }).sort({ created_at: -1 });

    let otp;
    let expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    if (!otpLog || otpLog.expires_at < new Date()) {
      otp = generateOTP();
      await OTPLog.create({
        email,
        otp,
        expires_at: expiresAt,
        verified: false,
      });
    } else {
      otp = otpLog.otp;
      await otpLog.updateOne({ expires_at: expiresAt });
    }

    if (process.env.APP_DEMO_MODE !== 'true' && email) {
      const user = await findUserByEmail(email);
      const sent = await EmailDispatcher.dispatch(
        email,
        'password-reset-otp',
        {
          user_name: user ? user.name : 'User',
          reset_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password`,
          otp_code: otp
        }
      );
      if (!sent.success) {
        console.error('[Resend OTP] Email Error:', sent.message);
        return res.status(500).json({ message: 'Failed to send OTP email' });
      }
    }

    return res.status(200).json({
      success: true,
      message: `OTP resent successfully to your email ${email}`,
      demo_otp: process.env.APP_DEMO_MODE === 'true' ? otp : null,
    });
  } catch (error) {
    console.error('Error resending OTP:', error);

    if (error.message === 'MAINTENANCE_MODE') {
      const settings = await getSettings();
      return res.status(503).json({ success: false, message: settings.maintenance_message || 'System under maintenance', maintenance: true, });
    }

    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const ip = req.ip;

  try {
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, Otp and new password are required.' });
    }

    await checkMaintenanceAccess(ip);

    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    if (!isValidPassword(newPassword)) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const otpRecord = await OTPLog.findOne({
      email,
      otp,
      verified: true,
      expires_at: { $gt: new Date() },
    }).sort({ created_at: -1 });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ success: false, message: 'User not exists.' });
    }

    const hashedPassword = await hashPassword(newPassword);

    await User.findByIdAndUpdate(user._id, { password: hashedPassword });
    await otpRecord.updateOne({ verified: true });

    EmailDispatcher.dispatch(user.email, 'password-reset-success', {
      user_name: user.name
    }).then(res => {
      if (!res.success) console.error('[Password Reset Success Email Error]', res.message);
    }).catch(err => console.error('Error sending password reset success email:', err));

    return res.status(200).json({ success: true, message: 'Password reset successfully.' });
  } catch (error) {
    if (error.message === 'MAINTENANCE_MODE') {
      const settings = await getSettings();
      return res.status(503).json({ success: false, message: settings.maintenance_message || 'System under maintenance', maintenance: true });
    }
    console.error('Reset password error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new passwords are required.' });
    }

    if (!isValidPassword(newPassword)) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    const hashedNewPassword = await hashPassword(newPassword);

    await User.findByIdAndUpdate(user._id, { password: hashedNewPassword });

    return res.status(200).json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.deactivateAccount = async (req, res) => {
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    await User.findByIdAndUpdate(userId, { isActive: false });
    await Session.updateMany({ user_id: userId, status: 'active' }, { status: 'inactive' });

    return res.status(200).json({ success: true, message: 'Account deactivated successfully.' });
  } catch (error) {
    console.error('Deactivate account error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};
