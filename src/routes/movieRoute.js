const express = require('express');
const movieController = require('../controllers/movieController.js');
const reviewController = require('../controllers/reviewController.js');
const authMiddleware = require('../middleware/authMiddleware.js');
const roleMiddleware = require('../middleware/roleMiddleware.js');
const validate = require('../middleware/validationMiddleware.js');
const MovieValidator = require('../validators/movieValidator.js');
const ReviewValidator = require('../validators/reviewValidator.js');

const router = express.Router();

// 👑 ADMIN ROUTES - Movie Management
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['admin']),
  validate(MovieValidator.create),
  movieController.createMovie
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['admin']),
  validate(MovieValidator.update),
  movieController.updateMovie
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(['admin']),
  movieController.deleteMovie
);

// 🌍 PUBLIC ROUTES - Movie Information
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

// 📊 MOVIE REVIEWS - Read Only (for movie-specific review data)
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

router.post(
  '/:movieId/reviews',
  authMiddleware,
  roleMiddleware(['user']),
  validate(ReviewValidator.createMovieReview),
  reviewController.createReview
);

module.exports = router;
