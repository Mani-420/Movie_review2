const crypto = require('crypto');
const emailService = require('../app/Services/emailService');

const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

const sendOTPEmail = async (email, otpCode, type) => {
  try {
    // Get user name from database (you might need to modify this)
    const name = 'User'; // You can improve this by passing name as parameter

    switch (type) {
      case 'signup':
      case 'verification':
        await emailService.sendOTPEmail(email, otpCode, name);
        break;
      case 'password_reset':
        await emailService.sendPasswordResetOTP(email, otpCode, name);
        break;
      default:
        throw new Error('Invalid OTP type');
    }
  } catch (error) {
    throw new Error('Failed to send OTP email: ' + error.message);
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail
};
