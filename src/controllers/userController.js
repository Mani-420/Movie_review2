const UserService = require('../app/Services/userService.js');
const asyncHandler = require('../utils/asyncHandler.js');

class UserController {
  constructor() {
    this.userService = new UserService();
  }

  // GET /users/me
  getProfile = asyncHandler(async (req, res) => {
    const userId = req.user.userId; // From auth middleware
    const result = await this.userService.getUserById(userId);
    res.status(200).json(result);
  });

  // PUT /users/me
  updateProfile = asyncHandler(async (req, res) => {
    const userId = req.user.userId; // From auth middleware
    // req.body is already validated by Zod
    const result = await this.userService.updateUser(userId, req.body);
    res.status(200).json(result);
  });

  // PUT /users/change-password
  changePassword = asyncHandler(async (req, res) => {
    const userId = req.user.userId; // From auth middleware
    // req.body is already validated by Zod
    const result = await this.userService.changePassword(userId, req.body);
    res.status(200).json(result);
  });

  // DELETE /users/me
  deleteAccount = asyncHandler(async (req, res) => {
    const userId = req.user.userId; // From auth middleware
    const result = await this.userService.deleteUser(userId);
    res.status(200).json(result);
  });

  // GET /users (Admin only)
  getAllUsers = asyncHandler(async (req, res) => {
    // req.query is already validated by Zod
    const result = await this.userService.getAllUsers(req.query);
    res.status(200).json(result);
  });

  // GET /users/:id (Admin only)
  getUserById = asyncHandler(async (req, res) => {
    // req.params.id is already validated and transformed by Zod
    const { id } = req.params;
    const result = await this.userService.getUserById(id);
    res.status(200).json(result);
  });
}

module.exports = new UserController();
