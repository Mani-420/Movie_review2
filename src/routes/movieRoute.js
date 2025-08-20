const express = require('express');
const movieController = require('../controllers/movieController.js');
const reviewController = require('../controllers/reviewController.js');
const authMiddleware = require('../middleware/authMiddleware.js');
const roleMiddleware = require('../middleware/roleMiddleware.js');
const validate = require('../middleware/validationMiddleware.js');
const MovieValidator = require('../validators/movieValidator.js');
const ReviewValidator = require('../validators/reviewValidator.js');

const router = express.Router();

// Public movie routes
router.get('/', validate(MovieValidator.getAll), movieController.getAllMovies);
router.get(
  '/search',
  validate(MovieValidator.search),
  movieController.searchMovies
);
router.get(
  '/top-rated',
  validate(MovieValidator.topRated),
  movieController.getTopRatedMovies
);
router.get(
  '/recent',
  validate(MovieValidator.recent),
  movieController.getRecentMovies
);
router.get(
  '/genre/:genre',
  validate(MovieValidator.byGenre),
  movieController.getMoviesByGenre
);
router.get(
  '/year/:year',
  validate(MovieValidator.byYear),
  movieController.getMoviesByYear
);
router.get(
  '/:id',
  validate(MovieValidator.getById),
  movieController.getMovieById
);

// Movie reviews routes
router.get(
  '/:movieId/reviews',
  validate(ReviewValidator.getMovieReviews),
  reviewController.getMovieReviews
);
router.get(
  '/:movieId/rating-stats',
  validate(ReviewValidator.getMovieRatingStats),
  reviewController.getMovieRatingStats
);

// Protected routes - Create review for movie
router.post(
  '/:movieId/reviews',
  authMiddleware,
  roleMiddleware(['user']),
  validate(ReviewValidator.create),
  reviewController.createReview
);

module.exports = router;
