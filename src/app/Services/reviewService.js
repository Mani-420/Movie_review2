// This will act as a Review Service for business logic
const { reviewRepository } = require('../Repositories/reviewRepository.js');
const { movieRepository } = require('../Repositories/movieRepository.js');
const userRepository = require('../Repositories/userRepository.js');

class ReviewService {
  constructor() {
    this.reviewRepository = reviewRepository;
    this.movieRepository = movieRepository;
    this.userRepository = userRepository;
  }

  // Create a new review (users only)
  async createReview(userId, movieId, reviewData) {
    try {
      const { rating, comment } = reviewData;

      // Validate rating
      if (!rating || rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }

      // Check if movie exists
      const movie = await movieRepository.getMovieById(movieId);
      if (!movie) {
        throw new Error('Movie not found');
      }

      // Check if user exists
      const user = await userRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Check if user already reviewed this movie
      const existingReview = await reviewRepository.getReviewByUserAndMovie(
        userId,
        movieId
      );
      if (existingReview) {
        throw new Error('You have already reviewed this movie');
      }

      // Create the review
      const newReview = await reviewRepository.createReview({
        movie_id: movieId,
        user_id: userId,
        rating: parseInt(rating),
        comment: comment || null
      });

      // Update movie rating statistics
      // await this.updateMovieRating(movieId);

      return {
        success: true,
        message: 'Review created successfully',
        review: newReview
      };
    } catch (error) {
      throw new Error('Error creating review: ' + error.message);
    }
  }

  // Get review by ID (public)
  async getReviewById(reviewId) {
    try {
      const review = await reviewRepository.getReviewById(reviewId);
      if (!review) {
        throw new Error('Review not found');
      }

      return {
        success: true,
        review
      };
    } catch (error) {
      throw new Error('Error fetching review: ' + error.message);
    }
  }

  // Update review (user can only update own review)
  async updateReview(userId, reviewId, updateData) {
    try {
      const { rating, comment } = updateData;

      // Check if review exists
      const existingReview = await reviewRepository.getReviewById(reviewId);
      if (!existingReview) {
        throw new Error('Review not found');
      }

      // Check if user owns this review
      if (existingReview.user_id !== userId) {
        throw new Error('You can only update your own reviews');
      }

      // Validate rating if provided
      if (rating && (rating < 1 || rating > 5)) {
        throw new Error('Rating must be between 1 and 5');
      }

      // Prepare update data
      const reviewUpdateData = {};
      if (rating) reviewUpdateData.rating = parseInt(rating);
      if (comment !== undefined) reviewUpdateData.comment = comment;

      // Update the review
      const updatedReview = await reviewRepository.updateReview(
        reviewId,
        reviewUpdateData
      );

      // Update movie rating if rating changed
      if (rating && rating !== existingReview.rating) {
        await this.updateMovieRating(existingReview.movie_id);
      }

      return {
        success: true,
        message: 'Review updated successfully',
        review: updatedReview
      };
    } catch (error) {
      throw new Error('Error updating review: ' + error.message);
    }
  }

  // Delete review (user can only delete own review)
  async deleteReview(userId, reviewId) {
    try {
      // Check if review exists
      const existingReview = await reviewRepository.getReviewById(reviewId);
      if (!existingReview) {
        throw new Error('Review not found');
      }

      // Check if user owns this review
      if (existingReview.user_id !== userId) {
        throw new Error('You can only delete your own reviews');
      }

      // Delete the review
      const result = await reviewRepository.deleteReview(reviewId);
      if (!result) {
        throw new Error('Failed to delete review');
      }

      // Update movie rating statistics
      // await this.updateMovieRating(existingReview.movie_id);

      return {
        success: true,
        message: 'Review deleted successfully'
      };
    } catch (error) {
      throw new Error('Error deleting review: ' + error.message);
    }
  }

  // Get all reviews for a movie (public)
  async getReviewsByMovieId(movieId) {
    try {
      // Check if movie exists
      const movie = await movieRepository.getMovieById(movieId);
      if (!movie) {
        throw new Error('Movie not found');
      }

      const reviews = await reviewRepository.getReviewsByMovieId(movieId);

      return {
        success: true,
        movieId,
        movieTitle: movie.title,
        count: reviews.length,
        reviews
      };
    } catch (error) {
      throw new Error('Error fetching movie reviews: ' + error.message);
    }
  }

  // Get all reviews by a user (public)
  async getReviewsByUserId(userId) {
    try {
      // Check if user exists
      const user = await userRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const reviews = await reviewRepository.getReviewsByUserId(userId);

      return {
        success: true,
        userId,
        userName: user.name,
        count: reviews.length,
        reviews
      };
    } catch (error) {
      throw new Error('Error fetching user reviews: ' + error.message);
    }
  }

  // Get reviews with pagination (public)
  async getReviewsWithPagination(page = 1, limit = 10, filters = {}) {
    try {
      const query = `
      SELECT 
        r.id,
        r.movie_id,
        r.user_id,
        r.rating,
        r.comment as reviewText,
        r.created_at,
        u.name as userName,
        m.title as movieTitle
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN movies m ON r.movie_id = m.id
      ORDER BY r.created_at DESC
    `;

      // ✅ No parameters needed
      const [reviews] = await reviewRepository.getAllReviews(query, []);

      return {
        success: true,
        message: 'Reviews retrieved successfully',
        data: {
          reviews
        }
      };
    } catch (error) {
      throw new Error('Error fetching reviews: ' + error.message);
    }
  }

  // Get movie rating statistics (public)
  async getMovieRatingStats(movieId) {
    try {
      // Check if movie exists
      const movie = await movieRepository.getMovieById(movieId);
      if (!movie) {
        throw new Error('Movie not found');
      }

      const stats = await reviewRepository.getMovieRatingStats(movieId);

      return {
        success: true,
        movieId,
        movieTitle: movie.title,
        statistics: {
          totalReviews: stats.total_reviews,
          averageRating: parseFloat(stats.average_rating).toFixed(2),
          ratingBreakdown: {
            1: stats.rating_1,
            2: stats.rating_2,
            3: stats.rating_3,
            4: stats.rating_4,
            5: stats.rating_5
          }
        }
      };
    } catch (error) {
      throw new Error(
        'Error fetching movie rating statistics: ' + error.message
      );
    }
  }

  // Get recent reviews (public - for homepage)
  //   async getRecentReviews(limit = 10) {
  //     try {
  //       const reviews = await reviewRepository.getRecentReviews(parseInt(limit));

  //       return {
  //         success: true,
  //         limit: parseInt(limit),
  //         count: reviews.length,
  //         reviews,
  //       };
  //     } catch (error) {
  //       throw new Error('Error fetching recent reviews: ' + error.message);
  //     }
  //   }

  // Get all reviews (admin only)
  async getAllReviews() {
    try {
      const reviews = await reviewRepository.getAllReviews();

      return {
        success: true,
        count: reviews.length,
        reviews
      };
    } catch (error) {
      throw new Error('Error fetching all reviews: ' + error.message);
    }
  }

  // Get reviews count (admin)
  async getReviewsCount() {
    try {
      const count = await reviewRepository.getReviewsCount();

      return {
        success: true,
        totalReviews: count
      };
    } catch (error) {
      throw new Error('Error fetching reviews count: ' + error.message);
    }
  }

  // Check if user can review movie
  async canUserReviewMovie(userId, movieId) {
    try {
      // Check if movie exists
      const movie = await movieRepository.getMovieById(movieId);
      if (!movie) {
        throw new Error('Movie not found');
      }

      // Check if user already reviewed
      const existingReview = await reviewRepository.getReviewByUserAndMovie(
        userId,
        movieId
      );

      return {
        success: true,
        canReview: !existingReview,
        hasExistingReview: !!existingReview,
        existingReview: existingReview || null
      };
    } catch (error) {
      throw new Error('Error checking review eligibility: ' + error.message);
    }
  }

  // Internal method to update movie rating after review changes
  // async updateMovieRating(movieId) {
  //   try {
  //     const stats = await reviewRepository.getMovieRatingStats(movieId);

  //     const averageRating =
  //       stats.total_reviews > 0
  //         ? parseFloat(stats.average_rating).toFixed(2)
  //         : 0;

  //     const totalReviews = stats.total_reviews;

  //     // Update movie ratings
  //     await movieRepository.updateMovieRating(
  //       movieId,
  //       averageRating,
  //       totalReviews
  //     );

  //     return {
  //       success: true,
  //       message: 'Movie rating updated successfully'
  //     };
  //   } catch (error) {
  //     throw new Error('Error updating movie rating: ' + error.message);
  //   }
  // }

  // Delete all reviews for a movie (when movie is deleted - admin only)
  async deleteReviewsByMovieId(movieId) {
    try {
      const deletedCount = await reviewRepository.deleteReviewsByMovieId(
        movieId
      );

      return {
        success: true,
        message: `${deletedCount} reviews deleted successfully`,
        deletedCount
      };
    } catch (error) {
      throw new Error('Error deleting movie reviews: ' + error.message);
    }
  }

  // Delete all reviews by a user (when user is deleted - admin only)
  async deleteReviewsByUserId(userId) {
    try {
      const deletedCount = await reviewRepository.deleteReviewsByUserId(userId);

      return {
        success: true,
        message: `${deletedCount} reviews deleted successfully`,
        deletedCount
      };
    } catch (error) {
      throw new Error('Error deleting user reviews: ' + error.message);
    }
  }
}

module.exports = ReviewService;
