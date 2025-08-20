const express = require('express');
const adminController = require('../controllers/adminController.js');
const authMiddleware = require('../middleware/authMiddleware.js');
const roleMiddleware = require('../middleware/roleMiddleware.js');
const validate = require('../middleware/validationMiddleware.js');
const MovieValidator = require('../validators/movieValidator.js');
const ReviewValidator = require('../validators/reviewValidator.js');
const UserValidator = require('../validators/userValidator.js');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(roleMiddleware(['admin']));

// Movie management routes
router.post(
  '/movies',
  validate(MovieValidator.create),
  adminController.createMovie
);
router.put(
  '/movies/:id',
  validate(MovieValidator.update),
  adminController.updateMovie
);
router.delete(
  '/movies/:id',
  validate(MovieValidator.delete),
  adminController.deleteMovie
);
router.get(
  '/movies',
  validate(MovieValidator.adminGetAll),
  adminController.getAllMoviesAdmin
);

// User management routes
router.get(
  '/users',
  validate(UserValidator.adminGetAll),
  adminController.getAllUsers
);

// Review management routes
router.get(
  '/reviews',
  validate(ReviewValidator.adminGetAll),
  adminController.getAllReviews
);

// Dashboard and statistics
router.get('/dashboard', adminController.getDashboardStats);

module.exports = router;
