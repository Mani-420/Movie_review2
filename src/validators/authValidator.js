const { z } = require('zod');

class AuthValidator {
  // POST /auth/signup
  static signup = z.object({
    body: z.object({
      name: z
        .string()
        .min(2, 'Name must be at least 2 characters long')
        .max(50, 'Name must be less than 50 characters')
        .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),

      email: z
        .string()
        .email('Please provide a valid email address')
        .toLowerCase(),

      password: z
        .string()
        .min(6, 'Password must be at least 6 characters long')
        .max(100, 'Password must be less than 100 characters')
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
          'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        ),

      role: z.enum(['user', 'admin']).optional().default('user')
    })
  });

  // POST /auth/login
  static login = z.object({
    body: z.object({
      email: z
        .string()
        .email('Please provide a valid email address')
        .toLowerCase(),

      password: z.string().min(1, 'Password is required')
    })
  });

  // POST /auth/verify-otp
  static verifyOTP = z.object({
    body: z.object({
      email: z
        .string()
        .email('Please provide a valid email address')
        .toLowerCase(),

      otpCode: z
        .string()
        .length(6, 'OTP code must be exactly 6 digits')
        .regex(/^\d{6}$/, 'OTP code must contain only numbers')
    })
  });

  // POST /auth/resend-otp
  static resendOTP = z.object({
    body: z.object({
      email: z
        .string()
        .email('Please provide a valid email address')
        .toLowerCase()
    })
  });

  // POST /auth/forgot-password
  static forgotPassword = z.object({
    body: z.object({
      email: z
        .string()
        .email('Please provide a valid email address')
        .toLowerCase()
    })
  });

  // POST /auth/reset-password
  static resetPassword = z.object({
    body: z.object({
      email: z
        .string()
        .email('Please provide a valid email address')
        .toLowerCase(),

      otpCode: z
        .string()
        .length(6, 'OTP code must be exactly 6 digits')
        .regex(/^\d{6}$/, 'OTP code must contain only numbers'),

      newPassword: z
        .string()
        .min(6, 'Password must be at least 6 characters long')
        .max(100, 'Password must be less than 100 characters')
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
          'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        )
    })
  });
}

module.exports = AuthValidator;
