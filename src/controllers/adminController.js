const MovieService = require('../app/Services/movieService.js');
const UserService = require('../app/Services/userService.js');
const ReviewService = require('../app/Services/reviewService.js');
const asyncHandler = require('../utils/asyncHandler.js');

class AdminController {
  constructor() {
    this.movieService = new MovieService();
    this.userService = new UserService();
    this.reviewService = new ReviewService();
  }

  // POST /admin/movies - Clean, no validation needed!
  createMovie = asyncHandler(async (req, res) => {
    // req.body is already validated and transformed by Zod
    const result = await this.movieService.createMovie(req.body);
    res.status(201).json(result);
  });

  // PUT /admin/movies/:id - Clean, no validation needed!
  updateMovie = asyncHandler(async (req, res) => {
    // req.params.id and req.body are already validated by Zod
    const { id } = req.params;
    const result = await this.movieService.updateMovie(id, req.body);
    res.status(200).json(result);
  });

  // DELETE /admin/movies/:id - Clean, no validation needed!
  deleteMovie = asyncHandler(async (req, res) => {
    // req.params.id is already validated by Zod
    const { id } = req.params;

    // Delete all reviews for this movie first
    await this.reviewService.deleteReviewsByMovieId(id);

    // Then delete the movie
    const result = await this.movieService.deleteMovie(id);
    res.status(200).json(result);
  });

  // GET /admin/movies - Clean, no validation needed!
  getAllMoviesAdmin = asyncHandler(async (req, res) => {
    // req.query is already validated and transformed by Zod
    const { page, limit, ...filters } = req.query;

    const result = await this.movieService.getMoviesWithPagination(
      page,
      limit,
      filters
    );
    res.status(200).json(result);
  });

  // GET /admin/dashboard - Clean!
  getDashboardStats = asyncHandler(async (req, res) => {
    const [movieStats, userCount, reviewCount] = await Promise.all([
      this.movieService.getMovieStatistics(),
      this.userService.getAllUsers(),
      this.reviewService.getReviewsCount(),
    ]);

    const dashboardData = {
      success: true,
      statistics: {
        totalMovies: movieStats.statistics.totalMovies,
        totalUsers: userCount.count || userCount.length,
        totalReviews: reviewCount.totalReviews,
        topRatedMovies: movieStats.statistics.topRatedMovies,
        recentMovies: movieStats.statistics.recentMovies,
      },
    };

    res.status(200).json(dashboardData);
  });

  // GET /admin/users - Clean, no validation needed!
  getAllUsers = asyncHandler(async (req, res) => {
    // req.query is already validated by Zod (if you add pagination)
    const result = await this.userService.getAllUsers();
    res.status(200).json(result);
  });

  // GET /admin/reviews - Clean, no validation needed!
  getAllReviews = asyncHandler(async (req, res) => {
    // req.query is already validated and transformed by Zod
    const { page, limit } = req.query;

    const result = await this.reviewService.getReviewsWithPagination(
      page,
      limit
    );
    res.status(200).json(result);
  });
}

module.exports = new AdminController();
