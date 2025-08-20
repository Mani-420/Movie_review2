// This will act as a User Authentication Service
const { userRepository } = require('../Repositories/userRepository.js');
const {
  hashPassword,
  comparePassword
} = require('../../utils/passwordUtils.js');
const { generateToken, verifyToken } = require('../../utils/tokenUtils.js');
const { generateOTP, sendOTPEmail } = require('../../utils/otpUtils.js');

class AuthService {
  constructor() {
    this.userRepository = userRepository;
  }

  // 🔐 AUTHENTICATION FLOWS
  async signup(userData) {
    try {
      const { email, password, name, role = 'user' } = userData;

      // Check if user already exists
      const existingUser = await this.userRepository.getUserByEmail(email);
      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Generate OTP for email verification
      const otpCode = generateOTP();
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Create user (unverified)
      const newUser = await this.userRepository.createUser({
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
      await sendOTPEmail(email, otpCode, 'signup');

      return {
        success: true,
        message:
          'User registered successfully. Please check your email for verification code.',
        userId: newUser.id,
        email: newUser.email
      };
    } catch (error) {
      throw new Error('Error during signup: ' + error.message);
    }
  }

  async verifyOTP(email, otpCode) {
    try {
      const user = await this.userRepository.getUserByEmail(email);
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

      // Mark user as verified and clear OTP
      await this.userRepository.updateUser(user.id, {
        is_verified: true,
        otp_code: null,
        otp_expires_at: null,
        otp_type: null
      });

      // Generate JWT token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      return {
        success: true,
        message: 'Account verified successfully',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      };
    } catch (error) {
      throw new Error('Error verifying OTP: ' + error.message);
    }
  }

  async resendOTP(email) {
    try {
      const user = await this.userRepository.getUserByEmail(email);
      if (!user) {
        throw new Error('User not found');
      }

      if (user.is_verified) {
        throw new Error('Account is already verified');
      }

      // Generate new OTP
      const otpCode = generateOTP();
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

      // Update user with new OTP
      await this.userRepository.updateUser(user.id, {
        otp_code: otpCode,
        otp_expires_at: otpExpiresAt
      });

      // Send OTP email
      await sendOTPEmail(email, otpCode, 'verification');

      return {
        success: true,
        message: 'OTP resent successfully'
      };
    } catch (error) {
      throw new Error('Error resending OTP: ' + error.message);
    }
  }

  async login(loginData) {
    try {
      const { email, password } = loginData;

      // Get user by email
      const user = await this.userRepository.getUserByEmail(email);
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
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      return {
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      };
    } catch (error) {
      throw new Error('Error during login: ' + error.message);
    }
  }

  async forgotPassword(email) {
    try {
      const user = await this.userRepository.getUserByEmail(email);
      if (!user) {
        throw new Error('User not found with this email');
      }

      // Generate OTP for password reset
      const otpCode = generateOTP();
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Update user with password reset OTP
      await this.userRepository.updateUser(user.id, {
        otp_code: otpCode,
        otp_expires_at: otpExpiresAt,
        otp_type: 'password_reset'
      });

      // Send password reset OTP
      await sendOTPEmail(email, otpCode, 'password_reset');

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
      const user = await this.userRepository.getUserByEmail(email);
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

      // Check OTP type
      if (user.otp_type !== 'password_reset') {
        throw new Error('Invalid OTP for password reset');
      }

      // Hash new password
      const hashedPassword = await hashPassword(newPassword);

      // Update password and clear OTP
      await this.userRepository.updateUser(user.id, {
        password_hash: hashedPassword,
        otp_code: null,
        otp_expires_at: null,
        otp_type: null
      });

      return {
        success: true,
        message: 'Password reset successfully'
      };
    } catch (error) {
      throw new Error('Error resetting password: ' + error.message);
    }
  }

  async logout(token) {
    try {
      // In a real application, you might want to blacklist the token
      // For now, we'll just return success
      return {
        success: true,
        message: 'Logged out successfully'
      };
    } catch (error) {
      throw new Error('Error during logout: ' + error.message);
    }
  }

  async getMe(token) {
    try {
      const decoded = verifyToken(token);
      const user = await this.userRepository.getUserById(decoded.userId);

      if (!user) {
        throw new Error('User not found');
      }

      return {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.is_verified,
          createdAt: user.created_at
        }
      };
    } catch (error) {
      throw new Error('Error getting user info: ' + error.message);
    }
  }
}

module.exports = AuthService;
