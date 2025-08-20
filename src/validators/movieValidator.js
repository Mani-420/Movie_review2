const { z } = require('zod');

class MovieValidator {
  // POST /admin/movies (Create Movie)
  static create = z.object({
    body: z.object({
      title: z
        .string()
        .min(1, 'Title is required')
        .max(255, 'Title must be less than 255 characters')
        .trim(),

      description: z
        .string()
        .max(1000, 'Description must be less than 1000 characters')
        .trim()
        .optional(),

      release_date: z
        .string()
        .regex(
          /^\d{4}-\d{2}-\d{2}$/,
          'Release date must be in YYYY-MM-DD format'
        )
        .optional(),

      genre: z
        .string()
        .min(1, 'Genre is required')
        .max(100, 'Genre must be less than 100 characters')
        .trim(),

      cast: z
        .string()
        .max(500, 'Cast must be less than 500 characters')
        .trim()
        .optional(),

      director: z
        .string()
        .max(255, 'Director name must be less than 255 characters')
        .trim()
        .optional(),

      duration_minutes: z
        .number()
        .int('Duration must be a whole number')
        .min(1, 'Duration must be at least 1 minute')
        .max(1000, 'Duration must be less than 1000 minutes')
        .optional()
    })
  });

  // ADD ALL THE MISSING METHODS YOUR ROUTES NEED:

  // GET /movies
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
      genre: z.string().optional(),
      search: z.string().optional(),
      year: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : undefined)),
      sortBy: z
        .enum(['title', 'release_date', 'created_at', 'average_rating'])
        .optional(),
      sortOrder: z.enum(['ASC', 'DESC']).optional()
    })
  });

  // GET /movies/search
  static search = z.object({
    query: z.object({
      q: z.string().min(1, 'Search query is required')
    })
  });

  // GET /movies/top-rated
  static topRated = z.object({
    query: z.object({
      limit: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 10))
    })
  });

  // GET /movies/recent
  static recent = z.object({
    query: z.object({
      limit: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 10))
    })
  });

  // GET /movies/genre/:genre
  static byGenre = z.object({
    params: z.object({
      genre: z.string().min(1, 'Genre is required')
    })
  });

  // GET /movies/year/:year
  static byYear = z.object({
    params: z.object({
      year: z.string().transform((val) => parseInt(val))
    })
  });

  // GET /movies/:id
  static getById = z.object({
    params: z.object({
      id: z.string().transform((val) => parseInt(val))
    })
  });
}

module.exports = MovieValidator;
