// This will act as a Movie Service for business logic
const { movieRepository } = require('../Repositories/movieRepository.js');

class MovieService {
  constructor() {
    this.movieRepository = movieRepository;
  }

  // Admin-only movie creation
  async createMovie(movieData) {
    try {
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

      // Basic validation
      if (!title || !genre) {
        throw new Error('Title and genre are required');
      }

      // Create movie
      const newMovie = await movieRepository.createMovie({
        title,
        description,
        release_date,
        genre,
        cast,
        director,
        duration_minutes,
        poster_url,
      });

      return {
        success: true,
        message: 'Movie created successfully',
        movie: newMovie,
      };
    } catch (error) {
      throw new Error('Error creating movie: ' + error.message);
    }
  }

  // Get single movie by ID (public)
  async getMovieById(movieId) {
    try {
      const movie = await movieRepository.getMovieById(movieId);
      if (!movie) {
        throw new Error('Movie not found');
      }

      return {
        success: true,
        movie,
      };
    } catch (error) {
      throw new Error('Error fetching movie: ' + error.message);
    }
  }

  // Admin-only movie update
  async updateMovie(movieId, updateData) {
    try {
      // Check if movie exists
      const existingMovie = await movieRepository.getMovieById(movieId);
      if (!existingMovie) {
        throw new Error('Movie not found');
      }

      // Update movie
      const updatedMovie = await movieRepository.updateMovie(
        movieId,
        updateData
      );

      return {
        success: true,
        message: 'Movie updated successfully',
        movie: updatedMovie,
      };
    } catch (error) {
      throw new Error('Error updating movie: ' + error.message);
    }
  }

  // Admin-only movie deletion
  async deleteMovie(movieId) {
    try {
      // Check if movie exists
      const existingMovie = await movieRepository.getMovieById(movieId);
      if (!existingMovie) {
        throw new Error('Movie not found');
      }

      const result = await movieRepository.deleteMovie(movieId);
      if (!result) {
        throw new Error('Failed to delete movie');
      }

      return {
        success: true,
        message: 'Movie deleted successfully',
      };
    } catch (error) {
      throw new Error('Error deleting movie: ' + error.message);
    }
  }

  // Get all movies with filters (public)
  async getAllMovies(filters = {}) {
    try {
      const movies = await movieRepository.getAllMovies(filters);

      return {
        success: true,
        count: movies.length,
        movies,
      };
    } catch (error) {
      throw new Error('Error fetching movies: ' + error.message);
    }
  }

  // Get movies with pagination (public)
  async getMoviesWithPagination(page = 1, limit = 10, filters = {}) {
    try {
      const result = await movieRepository.getMoviesWithPagination(
        page,
        limit,
        filters
      );

      return {
        success: true,
        data: result.movies,
        pagination: result.pagination,
      };
    } catch (error) {
      throw new Error(
        'Error fetching movies with pagination: ' + error.message
      );
    }
  }

  // Search movies (public)
  async searchMovies(searchTerm) {
    try {
      if (!searchTerm || searchTerm.trim().length === 0) {
        throw new Error('Search term is required');
      }

      const movies = await movieRepository.searchMovies(searchTerm.trim());

      return {
        success: true,
        searchTerm,
        count: movies.length,
        movies,
      };
    } catch (error) {
      throw new Error('Error searching movies: ' + error.message);
    }
  }

  // Get movies by genre (public)
  async getMoviesByGenre(genre) {
    try {
      if (!genre) {
        throw new Error('Genre is required');
      }

      const movies = await movieRepository.getMoviesByGenre(genre);

      return {
        success: true,
        genre,
        count: movies.length,
        movies,
      };
    } catch (error) {
      throw new Error('Error fetching movies by genre: ' + error.message);
    }
  }

  // Get movies by year (public)
  async getMoviesByYear(year) {
    try {
      if (!year) {
        throw new Error('Year is required');
      }

      const movies = await movieRepository.getMoviesByYear(year);

      return {
        success: true,
        year,
        count: movies.length,
        movies,
      };
    } catch (error) {
      throw new Error('Error fetching movies by year: ' + error.message);
    }
  }

  // Get top rated movies (public)
  async getTopRatedMovies(limit = 10) {
    try {
      const movies = await movieRepository.getTopRatedMovies(parseInt(limit));

      return {
        success: true,
        limit: parseInt(limit),
        count: movies.length,
        movies,
      };
    } catch (error) {
      throw new Error('Error fetching top rated movies: ' + error.message);
    }
  }

  // Get recent movies (public)
  async getRecentMovies(limit = 10) {
    try {
      const movies = await movieRepository.getRecentMovies(parseInt(limit));

      return {
        success: true,
        limit: parseInt(limit),
        count: movies.length,
        movies,
      };
    } catch (error) {
      throw new Error('Error fetching recent movies: ' + error.message);
    }
  }

  // Get movies count (admin)
  async getMoviesCount() {
    try {
      const count = await movieRepository.getMoviesCount();

      return {
        success: true,
        totalMovies: count,
      };
    } catch (error) {
      throw new Error('Error fetching movies count: ' + error.message);
    }
  }

  // Update movie rating (internal use - called when reviews change)
  async updateMovieRating(movieId, newRating, newCount) {
    try {
      await movieRepository.updateMovieRating(movieId, newRating, newCount);

      return {
        success: true,
        message: 'Movie rating updated successfully',
      };
    } catch (error) {
      throw new Error('Error updating movie rating: ' + error.message);
    }
  }

  // Get movie statistics (admin)
  //   async getMovieStatistics() {
  //     try {
  //       const totalMovies = await movieRepository.getMoviesCount();
  //       const topRated = await movieRepository.getTopRatedMovies(5);
  //       const recent = await movieRepository.getRecentMovies(5);

  //       return {
  //         success: true,
  //         statistics: {
  //           totalMovies,
  //           topRatedMovies: topRated,
  //           recentMovies: recent
  //         }
  //       };
  //     } catch (error) {
  //       throw new Error('Error fetching movie statistics: ' + error.message);
  //     }
  //   }
}

module.exports = MovieService;
