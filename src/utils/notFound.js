// Middleware to handle 404 Not Found errors
const notFound = (req, res, next) => {
  const error = new Error(`No endpoint at ${req.originalUrl}`);
  error.status = 404; // Set the status code to 404
  next(error); // Pass the error to the next middleware
};

module.exports = notFound;
