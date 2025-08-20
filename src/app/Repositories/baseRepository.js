const { pool } = require('../../database/connection.js');

class BaseRepository {
  constructor() {
    this.db = pool;
  }

  // Helper method to execute queries
  async execute(query, params = []) {
    try {
      const [rows] = await this.db.execute(query, params);
      return rows;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  // Helper method for single row queries
  async executeOne(query, params = []) {
    try {
      const [rows] = await this.db.execute(query, params);
      return rows[0] || null;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  // Helper method for insert operations
  async executeInsert(query, params = []) {
    try {
      const [result] = await this.db.execute(query, params);
      return result.insertId;
    } catch (error) {
      console.error('Database insert error:', error);
      throw error;
    }
  }
}

module.exports = BaseRepository;
