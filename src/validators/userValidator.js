const { z } = require('zod');

class UserValidator {
  // PUT /users/me (Update Profile)
  static updateProfile = z.object({
    body: z
      .object({
        name: z
          .string()
          .min(2, 'Name must be at least 2 characters long')
          .max(50, 'Name must be less than 50 characters')
          .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
          .optional(),

        email: z
          .string()
          .email('Please provide a valid email address')
          .toLowerCase()
          .optional()
      })
      .refine((data) => data.name || data.email, {
        message: 'At least one field (name or email) is required for update'
      })
  });

  // PUT /users/change-password
  static changePassword = z.object({
    body: z
      .object({
        currentPassword: z.string().min(1, 'Current password is required'),

        newPassword: z
          .string()
          .min(6, 'New password must be at least 6 characters long')
          .max(100, 'New password must be less than 100 characters')
          .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'New password must contain at least one uppercase letter, one lowercase letter, and one number'
          )
      })
      .refine((data) => data.currentPassword !== data.newPassword, {
        message: 'New password must be different from current password',
        path: ['newPassword']
      })
  });

  // GET /users/:id (Admin only)
  static getUserById = z.object({
    params: z.object({
      id: z
        .string()
        .regex(/^\d+$/, 'User ID must be a valid number')
        .transform(Number)
    })
  });

  // Query parameters for GET /users (pagination)
  static getAllUsers = z.object({
    query: z.object({
      page: z
        .string()
        .regex(/^\d+$/, 'Page must be a positive number')
        .transform(Number)
        .refine((val) => val > 0, 'Page must be greater than 0')
        .optional()
        .default('1'),

      limit: z
        .string()
        .regex(/^\d+$/, 'Limit must be a positive number')
        .transform(Number)
        .refine(
          (val) => val > 0 && val <= 100,
          'Limit must be between 1 and 100'
        )
        .optional()
        .default('10'),

      role: z.enum(['user', 'admin']).optional(),

      verified: z
        .string()
        .transform((val) => val === 'true')
        .optional()
    })
  });

  static getAll = z.object({
    query: z.object({
      page: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 1)),
      limit: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 10))
    })
  });

  static getById = z.object({
    params: z.object({
      id: z.string().transform((val) => parseInt(val))
    })
  });

  static adminGetAll = z.object({
    query: z.object({
      page: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 1)),
      limit: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 10)),
      role: z.enum(['user', 'admin']).optional(),
      verified: z
        .string()
        .optional()
        .transform((val) => val === 'true')
    })
  });

  static updateProfile = z.object({
    body: z.object({
      name: z.string().min(1, 'Name is required').max(100).optional(),
      email: z.string().email('Invalid email').optional()
    })
  });

  static changePassword = z.object({
    body: z.object({
      currentPassword: z.string().min(1, 'Current password is required'),
      newPassword: z
        .string()
        .min(6, 'Password must be at least 6 characters')
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
          'Password must contain uppercase, lowercase, and number'
        )
    })
  });
}

module.exports = UserValidator;
