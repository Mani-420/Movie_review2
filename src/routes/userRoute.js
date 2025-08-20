const express = require('express');
const userController = require('../controllers/userController.js');
const authMiddleware = require('../middleware/authMiddleware.js');
const roleMiddleware = require('../middleware/roleMiddleware.js');
const validate = require('../middleware/validationMiddleware.js');
const UserValidator = require('../validators/userValidator.js');

const router = express.Router();

// All user routes require authentication
router.use(authMiddleware);

// User profile routes
router.get('/me', userController.getProfile);
router.put(
  '/me',
  validate(UserValidator.updateProfile),
  userController.updateProfile
);
router.delete('/me', userController.deleteAccount);

// Password management
router.put(
  '/change-password',
  validate(UserValidator.changePassword),
  userController.changePassword
);

// Admin only routes
router.get(
  '/',
  roleMiddleware(['admin']),
  validate(UserValidator.getAll),
  userController.getAllUsers
);

router.get(
  '/:id',
  roleMiddleware(['admin']),
  validate(UserValidator.getById),
  userController.getUserById
);

module.exports = router;
