const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  // Send OTP for signup verification
  async sendOTPEmail(email, otp, name) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Verify Your Email - Movie Review Platform',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome to Movie Review Platform!</h2>
            <p>Hi ${name},</p>
            <p>Thank you for signing up. Please verify your email address using the OTP below:</p>
            <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #333; font-size: 32px; margin: 0;">${otp}</h1>
            </div>
            <p>This OTP will expire in 5 minutes.</p>
            <p>If you didn't create an account, please ignore this email.</p>
            <p>Best regards,<br>Movie Review Platform Team</p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log('OTP email sent successfully to:', email);
    } catch (error) {
      console.error('Failed to send OTP email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  // Send OTP for password reset
  async sendPasswordResetOTP(email, otp, name) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Password Reset - Movie Review Platform',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Password Reset Request</h2>
            <p>Hi ${name},</p>
            <p>You requested to reset your password. Use the OTP below to reset your password:</p>
            <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #333; font-size: 32px; margin: 0;">${otp}</h1>
            </div>
            <p>This OTP will expire in 5 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <p>Best regards,<br>Movie Review Platform Team</p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log('Password reset OTP sent successfully to:', email);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }
}

module.exports = new EmailService();
