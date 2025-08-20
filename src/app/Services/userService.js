// This will act as a User Authentication Service
const { userRepository } = require('../repositories/userRepository.js');
const {
  hashPassword,
  comparePassword,
} = require('../../utils/passwordUtils.js');
const { generateToken } = require('../../utils/tokenUtils.js');
const asyncHandler = require('../../utils/asyncHandler.js');

class UserService {
  constructor() {
    this.userRepository = userRepository;
  }

  async registerUser(userData) {
    try {
      const { email, password, name, role = 'user' } = userData;

      // Check if user already exists with this email
      const existingUserByEmail = await userRepository.getUserByEmail(email);
      if (existingUserByEmail) {
        throw new Error('User with this email already exists');
      }

      // Hash the password
      const hashedPassword = await hashPassword(password);

      // Create User with MySQL field names
      const newUser = await userRepository.createUser({
        name,
        email,
        password_hash: hashedPassword, // ✅ Correct MySQL field name
        role,
        is_verified: false, // ✅ Will be verified via OTP
      });

      // Generate JWT Token with MySQL id
      const token = generateToken({
        userId: newUser.id, // ✅ MySQL uses 'id', not '_id'
        role: newUser.role,
      });

      // Remove sensitive data
      const {
        password_hash,
        otp_code,
        otp_expires_at,
        ...userWithoutSensitiveData
      } = newUser;

      // Return User Data
      return {
        success: true,
        message: 'User registered successfully. Please verify your account.',
        user: userWithoutSensitiveData,
        token,
      };
    } catch (error) {
      throw new Error('Error registering user: ' + error.message);
    }
  }

  async loginUser(loginData) {
    try {
      const { email, password } = loginData;

      // Check if user exists with this email
      const existingUser = await userRepository.getUserByEmail(email);
      if (!existingUser) {
        throw new Error('Invalid email or password');
      }

      // ✅ Check if user account is verified
      if (!existingUser.is_verified) {
        throw new Error('Please verify your account before logging in');
      }

      // Compare password with hashed password
      const isPasswordValid = await comparePassword(
        password,
        existingUser.password_hash
      );
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Generate JWT Token
      const token = generateToken({
        userId: existingUser.id, // ✅ MySQL field name
        role: existingUser.role,
      });

      // Remove sensitive data from user object
      const {
        password_hash,
        otp_code,
        otp_expires_at,
        ...userWithoutSensitiveData
      } = existingUser;

      // Return User Data
      return {
        success: true,
        message: 'User logged in successfully',
        user: userWithoutSensitiveData,
        token,
      };
    } catch (error) {
      throw new Error('Error logging in user: ' + error.message);
    }
  }

  async getUserById(userId) {
    try {
      const user = await userRepository.getUserById(userId); // ✅ Fixed method name
      if (!user) {
        throw new Error('User not found');
      }

      // Remove sensitive data
      const {
        password_hash,
        otp_code,
        otp_expires_at,
        ...userWithoutSensitiveData
      } = user;
      return userWithoutSensitiveData;
    } catch (error) {
      throw new Error('Error fetching user: ' + error.message);
    }
  }

  async updateUser(userId, userData) {
    try {
      // Hash password if provided
      if (userData.password) {
        userData.password_hash = await hashPassword(userData.password); // ✅ Correct field name
        delete userData.password; // Remove plain password
      }

      const updatedUser = await userRepository.updateUser(userId, userData);
      if (!updatedUser) {
        throw new Error('User not found');
      }

      // Remove sensitive data
      const {
        password_hash,
        otp_code,
        otp_expires_at,
        ...userWithoutSensitiveData
      } = updatedUser;
      return userWithoutSensitiveData;
    } catch (error) {
      throw new Error('Error updating user: ' + error.message);
    }
  }

  async deleteUser(userId) {
    try {
      const result = await userRepository.deleteUser(userId);
      if (!result) {
        throw new Error('User not found');
      }
      return {
        success: true,
        message: 'User deleted successfully',
      };
    } catch (error) {
      throw new Error('Error deleting user: ' + error.message);
    }
  }

  async getAllUsers() {
    try {
      const users = await userRepository.getAllUsers(); // ✅ Fixed method name

      // Remove sensitive data from all users
      return users.map((user) => {
        const {
          password_hash,
          otp_code,
          otp_expires_at,
          ...userWithoutSensitiveData
        } = user;
        return userWithoutSensitiveData;
      });
    } catch (error) {
      throw new Error('Error fetching users: ' + error.message);
    }
  }

  // ✅ Additional OTP-related methods for your requirements
  async generateOTP(email, type = 'signup') {
    try {
      const user = await userRepository.getUserByEmail(email);
      if (!user) {
        throw new Error('User not found');
      }

      // Generate 6-digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Update user with OTP
      await userRepository.updateUser(user.id, {
        otp_code: otpCode,
        otp_expires_at: otpExpiresAt,
        otp_type: type,
      });

      return {
        success: true,
        message: 'OTP generated successfully',
        otpCode, // You'll send this via email/SMS
      };
    } catch (error) {
      throw new Error('Error generating OTP: ' + error.message);
    }
  }

  async verifyOTP(email, otpCode) {
    try {
      const user = await userRepository.getUserByEmail(email);
      if (!user) {
        throw new Error('User not found');
      }

      // Check OTP validity
      if (user.otp_code !== otpCode) {
        throw new Error('Invalid OTP');
      }

      // Check OTP expiry
      if (new Date() > new Date(user.otp_expires_at)) {
        throw new Error('OTP has expired');
      }

      // Mark user as verified and clear OTP
      await userRepository.updateUser(user.id, {
        is_verified: true,
        otp_code: null,
        otp_expires_at: null,
        otp_type: null,
      });

      return {
        success: true,
        message: 'Account verified successfully',
      };
    } catch (error) {
      throw new Error('Error verifying OTP: ' + error.message);
    }
  }
}

module.exports = UserService;
