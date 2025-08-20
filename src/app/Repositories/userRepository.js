// This will act as a User Repository for MySQL
const db = require('../../database/connection.js');

class UserRepository {
  constructor() {
    this.db = db;
  }

  async createUser(userData) {
    const { name, email, password_hash, role, is_verified } = userData;

    const query = `
      INSERT INTO users (name, email, password_hash, role, is_verified)
      VALUES (?, ?, ?, ?, ?)
    `;

    const [result] = await this.db.execute(query, [
      name,
      email,
      password_hash,
      role,
      is_verified,
    ]);

    // Return the created user
    return await this.getUserById(result.insertId);
  }

  async getUserById(userId) {
    const query = `SELECT * FROM users WHERE id = ?`;
    const [rows] = await this.db.execute(query, [userId]);

    return rows.length > 0 ? rows[0] : null;
  }

  async getUserByEmail(email) {
    const query = `SELECT * FROM users WHERE email = ?`;
    const [rows] = await this.db.execute(query, [email]);

    return rows.length > 0 ? rows[0] : null;
  }

  async getUserByUsername(username) {
    const query = `SELECT * FROM users WHERE username = ?`;
    const [rows] = await this.db.execute(query, [username]);

    return rows.length > 0 ? rows[0] : null;
  }

  async updateUser(userId, updateData) {
    // Build dynamic UPDATE query
    const fields = Object.keys(updateData);
    const values = Object.values(updateData);

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    const setClause = fields.map((field) => `${field} = ?`).join(', ');
    const query = `UPDATE users SET ${setClause} WHERE id = ?`;

    await this.db.execute(query, [...values, userId]);

    // Return updated user
    return await this.getUserById(userId);
  }

  async deleteUser(userId) {
    const query = `DELETE FROM users WHERE id = ?`;
    const [result] = await this.db.execute(query, [userId]);

    return result.affectedRows > 0;
  }

  async getAllUsers() {
    const query = `SELECT * FROM users ORDER BY created_at DESC`;
    const [rows] = await this.db.execute(query);

    return rows;
  }

  // Additional useful methods for your project
  async getUsersByRole(role) {
    const query = `SELECT * FROM users WHERE role = ?`;
    const [rows] = await this.db.execute(query, [role]);

    return rows;
  }

  async getVerifiedUsers() {
    const query = `SELECT * FROM users WHERE is_verified = true`;
    const [rows] = await this.db.execute(query);

    return rows;
  }

  async getUsersCount() {
    const query = `SELECT COUNT(*) as count FROM users`;
    const [rows] = await this.db.execute(query);

    return rows[0].count;
  }

  // OTP-related methods
  async getUserByOTP(otpCode) {
    const query = `
      SELECT * FROM users 
      WHERE otp_code = ? AND otp_expires_at > NOW()
    `;
    const [rows] = await this.db.execute(query, [otpCode]);

    return rows.length > 0 ? rows[0] : null;
  }

  async clearUserOTP(userId) {
    const query = `
      UPDATE users 
      SET otp_code = NULL, otp_expires_at = NULL, otp_type = NULL 
      WHERE id = ?
    `;
    await this.db.execute(query, [userId]);
  }
}

// Create and export a single instance
const userRepository = new UserRepository();
module.exports = { userRepository };
