const MovieService = require('../app/Services/movieService.js');
const asyncHandler = require('../utils/asyncHandler.js');

class MovieController {
  constructor() {
    this.movieService = new MovieService();
  }

  // Create Movies
  // createMovie = asyncHandler(async (req, res) => {
  //   const result = await this.movieService.createMovie(req.body);
  //   res.status(201).json(result);
  // });

  // Update Movie
  // updateMovie = asyncHandler(async (req, res) => {
  //   const { id } = req.params;
  //   const result = await this.movieService.updateMovie(id, req.body);
  //   res.status(200).json(result);
  // });

  // Delete Movie
  // deleteMovie = asyncHandler(async (req, res) => {
  //   const { id } = req.params;
  //   const result = await this.movieService.deleteMovie(id);
  //   res.status(200).json(result);
  // });

  // GET /movies
  getAllMovies = asyncHandler(async (req, res) => {
    // req.query is already validated and transformed by Zod
    const { page, limit, ...filters } = req.query;

    const result = await this.movieService.getMoviesWithPagination(
      page,
      limit,
      filters
    );
    res.status(200).json(result);
  });

  // GET /movies/:id
  getMovieById = asyncHandler(async (req, res) => {
    // req.params.id is already validated and transformed by Zod
    const { id } = req.params;
    const result = await this.movieService.getMovieById(id);
    res.status(200).json(result);
  });

  // GET /movies/search
  searchMovies = asyncHandler(async (req, res) => {
    // req.query.q is already validated by Zod
    const { q } = req.query;
    const result = await this.movieService.searchMovies(q);
    res.status(200).json(result);
  });

  // GET /movies/genre/:genre
  getMoviesByGenre = asyncHandler(async (req, res) => {
    // req.params.genre is already validated by Zod
    const { genre } = req.params;
    const result = await this.movieService.getMoviesByGenre(genre);
    res.status(200).json(result);
  });

  // GET /movies/year/:year
  getMoviesByYear = asyncHandler(async (req, res) => {
    // req.params.year is already validated and transformed by Zod
    const { year } = req.params;
    const result = await this.movieService.getMoviesByYear(year);
    res.status(200).json(result);
  });

  // GET /movies/top-rated
  getTopRatedMovies = asyncHandler(async (req, res) => {
    // req.query.limit is already validated and transformed by Zod
    const { limit } = req.query;
    const result = await this.movieService.getTopRatedMovies(limit);
    res.status(200).json(result);
  });

  // GET /movies/recent
  getRecentMovies = asyncHandler(async (req, res) => {
    // req.query.limit is already validated and transformed by Zod
    const { limit } = req.query;
    const result = await this.movieService.getRecentMovies(limit);
    res.status(200).json(result);
  });
}

module.exports = new MovieController();
