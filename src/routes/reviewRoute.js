const express = require('express');
const reviewController = require('../controllers/reviewController.js');
const authMiddleware = require('../middleware/authMiddleware.js');
const roleMiddleware = require('../middleware/roleMiddleware.js');
const validate = require('../middleware/validationMiddleware.js');
const ReviewValidator = require('../validators/reviewValidator.js');

const router = express.Router();

// Public review routes
router.get(
  '/',
  validate(ReviewValidator.getAll),
  reviewController.getReviewsWithPagination
);
router.get(
  '/recent',
  validate(ReviewValidator.getRecent),
  reviewController.getRecentReviews
);
router.get(
  '/user/:userId',
  validate(ReviewValidator.getUserReviews),
  reviewController.getUserReviews
);
router.get(
  '/:id',
  validate(ReviewValidator.getById),
  reviewController.getReviewById
);

// Protected routes - User can manage their own reviews
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['user']),
  validate(ReviewValidator.update),
  reviewController.updateReview
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(['user']),
  validate(ReviewValidator.delete),
  reviewController.deleteReview
);

module.exports = router;
