const { z } = require('zod');

class ReviewValidator {
  // POST /movies/:movieId/reviews (Create Review)
  static create = z.object({
    params: z.object({
      movieId: z
        .string()
        .regex(/^\d+$/, 'Movie ID must be a valid number')
        .transform(Number)
    }),
    body: z.object({
      rating: z
        .number()
        .int('Rating must be a whole number')
        .min(1, 'Rating must be at least 1')
        .max(5, 'Rating must be at most 5'),

      comment: z
        .string()
        .max(1000, 'Comment must be less than 1000 characters')
        .trim()
        .optional()
    })
  });

  // Add this to your ReviewValidator class
  static createMovieReview = z.object({
    params: z.object({
      movieId: z.string().transform((val) => {
        const num = parseInt(val, 10);
        if (isNaN(num)) throw new Error('Invalid movieId');
        return num;
      })
    }),
    body: z.object({
      rating: z
        .number()
        .int()
        .min(1, 'Rating must be at least 1')
        .max(5, 'Rating must be at most 5'),
      reviewText: z
        .string()
        .min(1, 'Review text is required')
        .max(1000, 'Review text must be less than 1000 characters')
        .trim()
    })
  });

  // PUT /reviews/:id (Update Review) - ADD THIS
  static update = z.object({
    params: z.object({
      id: z
        .string()
        .regex(/^\d+$/, 'Review ID must be a valid number')
        .transform(Number)
    }),
    body: z
      .object({
        rating: z
          .number()
          .int('Rating must be a whole number')
          .min(1, 'Rating must be at least 1')
          .max(5, 'Rating must be at most 5')
          .optional(),

        comment: z
          .string()
          .max(1000, 'Comment must be less than 1000 characters')
          .trim()
          .optional()
      })
      .refine(
        (data) => data.rating !== undefined || data.comment !== undefined,
        {
          message: 'At least rating or comment is required for update'
        }
      )
  });

  // DELETE /reviews/:id - ADD THIS
  static delete = z.object({
    params: z.object({
      id: z
        .string()
        .regex(/^\d+$/, 'Review ID must be a valid number')
        .transform(Number)
    })
  });

  // GET /reviews - ADD THIS
  static getAll = z.object({
    query: z.object({
      page: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 1)),
      limit: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 10)),
      movieId: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : undefined)),
      userId: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : undefined))
    })
  });

  // GET /reviews/recent - ADD THIS
  static getRecent = z.object({
    query: z.object({
      limit: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 10))
    })
  });

  // GET /reviews/user/:userId - ADD THIS
  static getUserReviews = z.object({
    params: z.object({
      userId: z
        .string()
        .regex(/^\d+$/, 'User ID must be a valid number')
        .transform(Number)
    })
  });

  // GET /reviews/:id - ADD THIS
  static getById = z.object({
    params: z.object({
      id: z
        .string()
        .regex(/^\d+$/, 'Review ID must be a valid number')
        .transform(Number)
    })
  });

  // GET /movies/:movieId/reviews - ADD THIS
  static getMovieReviews = z.object({
    params: z.object({
      movieId: z
        .string()
        .regex(/^\d+$/, 'Movie ID must be a valid number')
        .transform(Number)
    })
  });

  // GET /movies/:movieId/rating-stats - ADD THIS
  static getMovieRatingStats = z.object({
    params: z.object({
      movieId: z
        .string()
        .regex(/^\d+$/, 'Movie ID must be a valid number')
        .transform(Number)
    })
  });
}

module.exports = ReviewValidator;
