const ReviewService = require('../app/Services/reviewService.js');
const asyncHandler = require('../utils/asyncHandler.js');

class ReviewController {
  constructor() {
    this.reviewService = new ReviewService();
  }

  // POST /movies/:movieId/reviews
  createReview = asyncHandler(async (req, res) => {
    // req.params.movieId and req.body are already validated by Zod
    const { movieId } = req.params;
    const { rating, reviewText } = req.body;
    const userId = req.user?.id; // From auth middleware

    if (!userId) {
      throw new Error('User ID not found in token');
    }

    // Add this in createReview method temporarily
    console.log('🔍 Full req.user object:', req.user);
    console.log('🔍 Available fields:', Object.keys(req.user || {}));

    // Call service with the correct signature (3 parameters)
    const reviewData = {
      rating,
      comment: reviewText // ← Map reviewText to comment
    };

    const result = await this.reviewService.createReview(
      userId,
      parseInt(movieId),
      reviewData
    );
    res.status(201).json(result);
  });

  // PUT /reviews/:id
  updateReview = asyncHandler(async (req, res) => {
    // req.params.id and req.body are already validated by Zod
    const { id } = req.params;
    const userId = req.user?.id; // From auth middleware

    const result = await this.reviewService.updateReview(userId, id, req.body);
    res.status(200).json(result);
  });

  // DELETE /reviews/:id
  deleteReview = asyncHandler(async (req, res) => {
    // req.params.id is already validated by Zod
    const { id } = req.params;
    const userId = req.user?.id; // From auth middleware

    const result = await this.reviewService.deleteReview(userId, id);
    res.status(200).json(result);
  });

  // GET /movies/:movieId/reviews
  getMovieReviews = asyncHandler(async (req, res) => {
    // req.params.movieId and req.query are already validated by Zod
    const { movieId } = req.params;
    const result = await this.reviewService.getReviewsByMovieId(movieId);
    res.status(200).json(result);
  });

  // GET /reviews/user/:userId
  getUserReviews = asyncHandler(async (req, res) => {
    // req.params.userId and req.query are already validated by Zod
    const { userId } = req.params;
    const result = await this.reviewService.getReviewsByUserId(userId);
    res.status(200).json(result);
  });

  // GET /reviews/:id
  getReviewById = asyncHandler(async (req, res) => {
    // req.params.id is already validated by Zod
    const { id } = req.params;
    const result = await this.reviewService.getReviewById(id);
    res.status(200).json(result);
  });

  // GET /movies/:movieId/rating-stats
  getMovieRatingStats = asyncHandler(async (req, res) => {
    // req.params.movieId is already validated by Zod
    const { movieId } = req.params;
    const result = await this.reviewService.getMovieRatingStats(movieId);
    res.status(200).json(result);
  });

  // GET /reviews/recent
  getRecentReviews = asyncHandler(async (req, res) => {
    // req.query.limit is already validated and transformed by Zod
    const { limit } = req.query;
    const result = await this.reviewService.getRecentReviews(limit);
    res.status(200).json(result);
  });

  // GET /reviews (with pagination and filters)
  getReviewsWithPagination = asyncHandler(async (req, res) => {
    // req.query is already validated and transformed by Zod
    const { page, limit, ...filters } = req.query;
    const result = await this.reviewService.getReviewsWithPagination(
      page,
      limit,
      filters
    );
    res.status(200).json(result);
  });
}

module.exports = new ReviewController();
