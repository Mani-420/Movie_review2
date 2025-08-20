// This will act as a Review Repository for MySQL
const { pool } = require('../../database/connection.js');

class ReviewRepository {
  constructor() {
    this.db = pool;
  }

  async createReview(reviewData) {
    const { movie_id, user_id, rating, comment } = reviewData;

    const query = `
      INSERT INTO reviews (movie_id, user_id, rating, comment)
      VALUES (?, ?, ?, ?)
    `;

    const [result] = await this.db.execute(query, [
      movie_id,
      user_id,
      rating,
      comment
    ]);

    // Return the created review
    return await this.getReviewById(result.insertId);
  }

  async getReviewById(reviewId) {
    const query = `SELECT * FROM reviews WHERE id = ?`;
    const [rows] = await this.db.execute(query, [reviewId]);

    return rows.length > 0 ? rows[0] : null;
  }

  async updateReview(reviewId, updateData) {
    // Build dynamic UPDATE query
    const fields = Object.keys(updateData);
    const values = Object.values(updateData);

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    const setClause = fields.map((field) => `${field} = ?`).join(', ');
    const query = `UPDATE reviews SET ${setClause} WHERE id = ?`;

    await this.db.execute(query, [...values, reviewId]);

    // Return updated review
    return await this.getReviewById(reviewId);
  }

  async deleteReview(reviewId) {
    const query = `DELETE FROM reviews WHERE id = ?`;
    const [result] = await this.db.execute(query, [reviewId]);

    return result.affectedRows > 0;
  }

  async getAllReviews() {
    const query = `SELECT * FROM reviews ORDER BY created_at DESC`;
    const [rows] = await this.db.execute(query);

    return rows;
  }

  // Get reviews for a specific movie
  async getReviewsByMovieId(movieId) {
    const query = `
      SELECT r.*, u.name as user_name 
      FROM reviews r 
      JOIN users u ON r.user_id = u.id 
      WHERE r.movie_id = ? 
      ORDER BY r.created_at DESC
    `;
    const [rows] = await this.db.execute(query, [movieId]);

    return rows;
  }

  // Add this method to your ReviewRepository class:

  async getReviewByUserAndMovie(userId, movieId) {
    try {
      const query = `
      SELECT * FROM reviews 
      WHERE user_id = ? AND movie_id = ? 
      LIMIT 1
    `;

      const [rows] = await this.db.execute(query, [userId, movieId]);
      return rows[0] || null;
    } catch (error) {
      throw new Error(
        'Database error in getReviewByUserAndMovie: ' + error.message
      );
    }
  }

  // Get reviews by a specific user
  async getReviewsByUserId(userId) {
    const query = `
      SELECT r.*, m.title as movie_title 
      FROM reviews r 
      JOIN movies m ON r.movie_id = m.id 
      WHERE r.user_id = ? 
      ORDER BY r.created_at DESC
    `;
    const [rows] = await this.db.execute(query, [userId]);

    return rows;
  }

  // Get reviews with pagination
  async getReviewsWithPagination(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;

    let query = `
      SELECT r.*, u.name as user_name, m.title as movie_title 
      FROM reviews r 
      JOIN users u ON r.user_id = u.id 
      JOIN movies m ON r.movie_id = m.id
    `;

    const queryParams = [];
    const whereConditions = [];

    // Add filters
    if (filters.movieId) {
      whereConditions.push(`r.movie_id = ?`);
      queryParams.push(filters.movieId);
    }

    if (filters.userId) {
      whereConditions.push(`r.user_id = ?`);
      queryParams.push(filters.userId);
    }

    if (filters.minRating) {
      whereConditions.push(`r.rating >= ?`);
      queryParams.push(filters.minRating);
    }

    if (filters.maxRating) {
      whereConditions.push(`r.rating <= ?`);
      queryParams.push(filters.maxRating);
    }

    // Add WHERE clause if filters exist
    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    // Add sorting and pagination
    query += ` ORDER BY r.created_at DESC LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);

    const [rows] = await this.db.execute(query, queryParams);

    // Get total count for pagination
    let countQuery = `SELECT COUNT(*) as total FROM reviews r`;
    let countParams = [];

    if (whereConditions.length > 0) {
      countQuery += ` WHERE ${whereConditions.join(' AND ')}`;
      countParams = queryParams.slice(0, -2); // Remove limit and offset
    }

    const [countResult] = await this.db.execute(countQuery, countParams);
    const total = countResult[0].total;

    return {
      reviews: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
  }

  // Get movie rating statistics
  async getMovieRatingStats(movieId) {
    const query = `
      SELECT 
        COUNT(*) as total_reviews,
        AVG(rating) as average_rating,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as rating_1,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as rating_2,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as rating_3,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as rating_4,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as rating_5
      FROM reviews 
      WHERE movie_id = ?
    `;
    const [rows] = await this.db.execute(query, [movieId]);

    return rows[0];
  }

  // Get recent reviews (for homepage/dashboard)
  async getRecentReviews(limit = 10) {
    const query = `
      SELECT r.*, u.name as user_name, m.title as movie_title 
      FROM reviews r 
      JOIN users u ON r.user_id = u.id 
      JOIN movies m ON r.movie_id = m.id 
      ORDER BY r.created_at DESC 
      LIMIT ?
    `;
    const [rows] = await this.db.execute(query, [limit]);

    return rows;
  }

  // Delete all reviews for a movie (when movie is deleted)
  async deleteReviewsByMovieId(movieId) {
    const query = `DELETE FROM reviews WHERE movie_id = ?`;
    const [result] = await this.db.execute(query, [movieId]);

    return result.affectedRows;
  }

  // Delete all reviews by a user (when user is deleted)
  async deleteReviewsByUserId(userId) {
    const query = `DELETE FROM reviews WHERE user_id = ?`;
    const [result] = await this.db.execute(query, [userId]);

    return result.affectedRows;
  }

  // Get reviews count
  async getReviewsCount() {
    const query = `SELECT COUNT(*) as count FROM reviews`;
    const [rows] = await this.db.execute(query);

    return rows[0].count;
  }
}

// Create and export a single instance
const reviewRepository = new ReviewRepository();
module.exports = { reviewRepository };
