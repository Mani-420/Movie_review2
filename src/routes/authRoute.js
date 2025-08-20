const express = require('express');
const authController = require('../controllers/authController.js');
const AuthValidator = require('../validators/authValidator.js');
const validate = require('../middleware/validationMiddleware.js');
const authMiddleware = require('../middleware/authMiddleware.js');

const router = express.Router();

// Public auth routes
router.post('/signup', validate(AuthValidator.signup), authController.signup);
router.post(
  '/verify-otp',
  validate(AuthValidator.verifyOTP),
  authController.verifyOTP
);
router.post(
  '/resend-otp',
  validate(AuthValidator.resendOTP),
  authController.resendOTP
);
router.post('/login', validate(AuthValidator.login), authController.login);
router.post(
  '/forgot-password',
  validate(AuthValidator.forgotPassword),
  authController.forgotPassword
);
router.post(
  '/reset-password',
  validate(AuthValidator.resetPassword),
  authController.resetPassword
);

// Protected auth routes
router.post('/logout', authMiddleware, authController.logout);
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
