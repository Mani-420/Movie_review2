const userRepository = require('../Repositories/userRepository.js');
const emailService = require('./emailService.js');
const {
  hashPassword,
  comparePassword
} = require('../../utils/passwordUtils.js');
const { generateOTP } = require('../../utils/otpUtils.js');
const jwt = require('jsonwebtoken');

class AuthService {
  async signup(userData) {
    try {
      const { email, password, name, role = 'user' } = userData;

      // Check if user already exists
      const existingUser = await userRepository.findByEmail(email);
      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Generate OTP for email verification
      const otpCode = generateOTP();
      const otpExpiresAt = new Date(
        Date.now() + parseInt(process.env.OTP_EXPIRES_IN)
      );

      // Create user (unverified)
      const userId = await userRepository.create({
        name,
        email,
        password_hash: hashedPassword,
        role,
        is_verified: false,
        otp_code: otpCode,
        otp_expires_at: otpExpiresAt,
        otp_type: 'signup'
      });

      // Send OTP email
      await emailService.sendOTPEmail(email, otpCode, name);

      return {
        success: true,
        message:
          'User registered successfully. Please check your email for verification code.',
        data: {
          userId: userId,
          email: email,
          name: name
        }
      };
    } catch (error) {
      throw new Error('Error during signup: ' + error.message);
    }
  }

  async verifyOTP(email, otpCode) {
    try {
      const user = await userRepository.findByEmail(email);
      if (!user) {
        throw new Error('User not found');
      }

      // Check OTP validity
      if (user.otp_code !== otpCode) {
        throw new Error('Invalid OTP code');
      }

      // Check OTP expiry
      if (new Date() > new Date(user.otp_expires_at)) {
        throw new Error('OTP has expired. Please request a new one.');
      }

      // Mark user as verified - Use dedicated method
      await userRepository.verifyUser(email);

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      return {
        success: true,
        message: 'Account verified successfully',
        data: {
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        }
      };
    } catch (error) {
      throw new Error('Error verifying OTP: ' + error.message);
    }
  }

  async login(loginData) {
    try {
      const { email, password } = loginData;

      // Get user by email
      const user = await userRepository.findByEmail(email);
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check if account is verified
      if (!user.is_verified) {
        throw new Error('Please verify your email before logging in');
      }

      // Compare password
      const isPasswordValid = await comparePassword(
        password,
        user.password_hash
      );
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Generate token
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      return {
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        }
      };
    } catch (error) {
      throw new Error('Error during login: ' + error.message);
    }
  }

  async forgotPassword(email) {
    try {
      const user = await userRepository.findByEmail(email);
      if (!user) {
        throw new Error('User not found with this email');
      }

      // Generate OTP for password reset
      const otpCode = generateOTP();
      const otpExpiresAt = new Date(
        Date.now() + parseInt(process.env.OTP_EXPIRES_IN)
      );

      // Update user with password reset OTP
      await userRepository.updateOTP(
        user.id,
        otpCode,
        otpExpiresAt,
        'password_reset'
      );

      // Send password reset OTP
      await emailService.sendPasswordResetOTP(email, otpCode, user.name);

      return {
        success: true,
        message: 'Password reset OTP sent to your email'
      };
    } catch (error) {
      throw new Error('Error sending password reset OTP: ' + error.message);
    }
  }

  async resetPassword(email, otpCode, newPassword) {
    try {
      const user = await userRepository.findByEmail(email);
      if (!user) {
        throw new Error('User not found');
      }

      // Check OTP validity and type
      if (user.otp_code !== otpCode || user.otp_type !== 'password_reset') {
        throw new Error('Invalid OTP code');
      }

      // Check OTP expiry
      if (new Date() > new Date(user.otp_expires_at)) {
        throw new Error('OTP has expired. Please request a new one.');
      }

      // Hash new password
      const hashedPassword = await hashPassword(newPassword);

      // Update password and clear OTP
      await userRepository.updatePassword(email, hashedPassword);

      return {
        success: true,
        message: 'Password reset successfully'
      };
    } catch (error) {
      throw new Error('Error resetting password: ' + error.message);
    }
  }

  async getMe(userId) {
    try {
      const user = await userRepository.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      return {
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.is_verified,
            createdAt: user.created_at
          }
        }
      };
    } catch (error) {
      throw new Error('Error getting user info: ' + error.message);
    }
  }

  // Add this method to your AuthService class

  async resendOTP(email) {
    try {
      // Find user by email
      const user = await userRepository.findByEmail(email);
      if (!user) {
        throw new Error('User not found');
      }

      if (user.is_verified) {
        throw new Error('User is already verified');
      }

      // Generate new OTP
      const otpCode = generateOTP();
      const otpExpiresAt = new Date(
        Date.now() + parseInt(process.env.OTP_EXPIRES_IN)
      );

      // Update user with new OTP
      await userRepository.updateOTP(user.id, otpCode, otpExpiresAt, 'signup');

      // Send OTP email
      await emailService.sendOTPEmail(email, otpCode, user.name);

      return {
        success: true,
        message: 'New OTP sent to your email',
        data: {
          email: email
        }
      };
    } catch (error) {
      throw new Error('Error resending OTP: ' + error.message);
    }
  }
}

// ✅ EXPORT INSTANCE, NOT CLASS
module.exports = new AuthService();
