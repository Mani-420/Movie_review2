// This will act as a Movie Repository for MySQL
const db = require('../../database/connection.js');

class MovieRepository {
  constructor() {
    this.db = db;
  }

  async createMovie(movieData) {
    const {
      title,
      description,
      release_date,
      genre,
      cast,
      director,
      duration_minutes,
      poster_url,
    } = movieData;

    const query = `
      INSERT INTO movies (
        title, description, release_date, genre, cast, 
        director, duration_minutes, poster_url
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await this.db.execute(query, [
      title,
      description,
      release_date,
      genre,
      cast,
      director,
      duration_minutes,
      poster_url,
    ]);

    // Return the created movie
    return await this.getMovieById(result.insertId);
  }

  async getMovieById(movieId) {
    const query = `SELECT * FROM movies WHERE id = ?`;
    const [rows] = await this.db.execute(query, [movieId]);

    return rows.length > 0 ? rows[0] : null;
  }

  async updateMovie(movieId, updateData) {
    // Build dynamic UPDATE query
    const fields = Object.keys(updateData);
    const values = Object.values(updateData);

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    const setClause = fields.map((field) => `${field} = ?`).join(', ');
    const query = `UPDATE movies SET ${setClause} WHERE id = ?`;

    await this.db.execute(query, [...values, movieId]);

    // Return updated movie
    return await this.getMovieById(movieId);
  }

  async deleteMovie(movieId) {
    const query = `DELETE FROM movies WHERE id = ?`;
    const [result] = await this.db.execute(query, [movieId]);

    return result.affectedRows > 0;
  }

  async getAllMovies(filters = {}) {
    let query = `SELECT * FROM movies`;
    const queryParams = [];
    const whereConditions = [];

    if (filters.search) {
      whereConditions.push(`(title LIKE ? OR description LIKE ?)`);
      queryParams.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    // if (filters.releaseYear) {
    //   whereConditions.push(`YEAR(release_date) = ?`);
    //   queryParams.push(filters.releaseYear);
    // }

    // Add WHERE clause if filters exist
    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    // Add sorting
    const sortBy = filters.sortBy || 'created_at';
    const sortOrder = filters.sortOrder || 'DESC';
    query += ` ORDER BY ${sortBy} ${sortOrder}`;

    // Add pagination
    if (filters.limit) {
      query += ` LIMIT ?`;
      queryParams.push(parseInt(filters.limit));

      if (filters.offset) {
        query += ` OFFSET ?`;
        queryParams.push(parseInt(filters.offset));
      }
    }

    const [rows] = await this.db.execute(query, queryParams);
    return rows;
  }

  // Additional methods for movie management
  // async getMoviesByGenre(genre) {
  //   const query = `SELECT * FROM movies WHERE genre = ? ORDER BY created_at DESC`;
  //   const [rows] = await this.db.execute(query, [genre]);
  //   return rows;
  // }

  // async getMoviesByYear(year) {
  //   const query = `SELECT * FROM movies WHERE YEAR(release_date) = ? ORDER BY release_date DESC`;
  //   const [rows] = await this.db.execute(query, [year]);
  //   return rows;
  // }

  async searchMovies(searchTerm) {
    const query = `
      SELECT * FROM movies 
      WHERE title LIKE ? OR description LIKE ? OR cast LIKE ? OR director LIKE ?
      ORDER BY title ASC
    `;
    const searchPattern = `%${searchTerm}%`;
    const [rows] = await this.db.execute(query, [
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
    ]);
    return rows;
  }

  // async getTopRatedMovies(limit = 10) {
  //   const query = `
  //     SELECT * FROM movies
  //     WHERE ratings_count > 0
  //     ORDER BY ratings_avg DESC, ratings_count DESC
  //     LIMIT ?
  //   `;
  //   const [rows] = await this.db.execute(query, [limit]);
  //   return rows;
  // }

  // async getRecentMovies(limit = 10) {
  //   const query = `
  //     SELECT * FROM movies
  //     ORDER BY created_at DESC
  //     LIMIT ?
  //   `;
  //   const [rows] = await this.db.execute(query, [limit]);
  //   return rows;
  // }

  async getMoviesCount() {
    const query = `SELECT COUNT(*) as count FROM movies`;
    const [rows] = await this.db.execute(query);
    return rows[0].count;
  }

  async updateMovieRating(movieId, newRating, newCount) {
    const query = `
      UPDATE movies
      SET ratings_avg = ?, ratings_count = ?
      WHERE id = ?
    `;
    await this.db.execute(query, [newRating, newCount, movieId]);
  }

  // Get movies with pagination and total count

  async getMoviesWithPagination(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;

    // Get movies with filters and pagination
    const movies = await this.getAllMovies({
      ...filters,
      limit,
      offset,
    });

    // Get total count for pagination info
    let countQuery = `SELECT COUNT(*) as total FROM movies`;
    const countParams = [];
    const whereConditions = [];

    // Apply same filters for count
    if (filters.genre) {
      whereConditions.push(`genre = ?`);
      countParams.push(filters.genre);
    }

    if (filters.search) {
      whereConditions.push(`(title LIKE ? OR description LIKE ?)`);
      countParams.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    if (filters.releaseYear) {
      whereConditions.push(`YEAR(release_date) = ?`);
      countParams.push(filters.releaseYear);
    }

    if (whereConditions.length > 0) {
      countQuery += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    const [countResult] = await this.db.execute(countQuery, countParams);
    const total = countResult[0].total;

    return {
      movies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }
}

// Create and export a single instance
const movieRepository = new MovieRepository();
module.exports = { movieRepository };
