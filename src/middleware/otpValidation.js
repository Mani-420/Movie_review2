// This will act as a middleware to validate OTP (One Time Password) for sensitive actions
const otpValidationMiddleware = (req, res, next) => {
  const { otp } = req.body;

  if (!otp) {
    return res.status(400).json({
      status: 'error',
      message: 'OTP is required',
    });
  }

  // Here you would typically verify the OTP (e.g., check against a database or cache)
  const isValidOtp = verifyOtp(otp);

  if (!isValidOtp) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid OTP',
    });
  }

  next();
};

module.exports = otpValidationMiddleware;
