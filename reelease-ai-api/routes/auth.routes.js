const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth');
const fs = require('fs').promises;
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const { uploadSingle } = require('../utils/upload');

router.post('/register', authController.register);
router.post('/register-verify', authController.verifyRegistration);
router.post('/login', authController.login);

router.post('/request-password-reset', authController.requestPasswordReset);
router.post('/verify-otp', authController.verifyOTP);
router.post('/resend-otp', authController.resendOTP);
router.post('/reset-password', authController.resetPassword);

router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, uploadSingle('avatars', 'avatar'), authController.updateProfile);
router.post('/change-password', authenticate, authController.changePassword);
router.post('/deactivate', authenticate, authController.deactivateAccount);

router.post('/logout', authenticate, authController.logout);

module.exports = router;