const BaseRepository = require('./baseRepository.js');

class UserRepository extends BaseRepository {
  constructor() {
    super();
  }

  // Create new user
  async create(userData) {
    const query = `
      INSERT INTO users (name, email, password_hash, role, is_verified, otp_code, otp_expires_at, otp_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      userData.name,
      userData.email,
      userData.password_hash,
      userData.role || 'user',
      userData.is_verified || false,
      userData.otp_code || null,
      userData.otp_expires_at || null,
      userData.otp_type || null
    ];

    return await this.executeInsert(query, params);
  }

  // Find user by email
  async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = ?';
    return await this.executeOne(query, [email]);
  }

  // Find user by ID
  async findById(id) {
    const query = 'SELECT * FROM users WHERE id = ?';
    return await this.executeOne(query, [id]);
  }

  // Update user OTP
  async updateOTP(userId, otpCode, otpExpiresAt, otpType) {
    const query = `
      UPDATE users 
      SET otp_code = ?, otp_expires_at = ?, otp_type = ?
      WHERE id = ?
    `;

    await this.execute(query, [otpCode, otpExpiresAt, otpType, userId]);
    return true;
  }

  // Verify user email
  async verifyUser(email) {
    const query = `
      UPDATE users 
      SET is_verified = true, otp_code = NULL, otp_expires_at = NULL, otp_type = NULL
      WHERE email = ?
    `;

    await this.execute(query, [email]);
    return true;
  }

  // Update user password
  async updatePassword(email, passwordHash) {
    const query = `
      UPDATE users 
      SET password_hash = ?, otp_code = NULL, otp_expires_at = NULL, otp_type = NULL
      WHERE email = ?
    `;

    await this.execute(query, [passwordHash, email]);
    return true;
  }

  // Update user profile
  async updateProfile(userId, updates) {
    const fields = [];
    const values = [];

    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(updates[key]);
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(userId);
    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;

    await this.execute(query, values);
    return true;
  }

  // Get all users (admin only)
  async findAll(limit = 10, offset = 0) {
    const query = `
      SELECT id, name, email, role, is_verified, created_at, updated_at
      FROM users 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;

    return await this.execute(query, [limit, offset]);
  }

  // Delete user
  async delete(userId) {
    const query = 'DELETE FROM users WHERE id = ?';
    await this.execute(query, [userId]);
    return true;
  }
}

module.exports = new UserRepository();
