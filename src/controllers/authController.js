const AuthService = require('../app/Services/authService.js');
const asyncHandler = require('../utils/asyncHandler.js');

class AuthController {
  constructor() {
    this.authService = AuthService;
  }

  // POST /auth/signup - Clean, no validation needed!
  signup = asyncHandler(async (req, res) => {
    // Validation handled by Zod middleware
    const result = await this.authService.signup(req.body);
    res.status(201).json(result);
  });

  // POST /auth/verify-otp - Much cleaner!
  verifyOTP = asyncHandler(async (req, res) => {
    const { email, otpCode } = req.body;
    const result = await this.authService.verifyOTP(email, otpCode);
    res.status(200).json(result);
  });

  // POST /auth/resend-otp
  resendOTP = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const result = await this.authService.resendOTP(email);
    res.status(200).json(result);
  });

  // POST /auth/login
  login = asyncHandler(async (req, res) => {
    const result = await this.authService.login(req.body);
    res.status(200).json(result);
  });

  // POST /auth/forgot-password
  forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const result = await this.authService.forgotPassword(email);
    res.status(200).json(result);
  });

  // POST /auth/reset-password
  resetPassword = asyncHandler(async (req, res) => {
    const { email, otpCode, newPassword } = req.body;
    const result = await this.authService.resetPassword(
      email,
      otpCode,
      newPassword
    );
    res.status(200).json(result);
  });

  // POST /auth/logout
  logout = asyncHandler(async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const result = await this.authService.logout(token);
    res.status(200).json(result);
  });

  // GET /auth/me - This will use auth middleware instead
  getMe = asyncHandler(async (req, res) => {
    // req.user will be set by auth middleware
    const result = await this.authService.getMe(req.user.token);
    res.status(200).json(result);
  });
}

module.exports = new AuthController();
