// This will act as a limiter so that users cannot exceed a certain number of requests in a given time frame
const rateLimit = (req, res, next) => {
  const userIp = req.ip;
  const currentTime = Date.now();

  // Initialize user data if not present
  if (!rateLimitData[userIp]) {
    rateLimitData[userIp] = {
      requestCount: 0,
      firstRequestTime: currentTime
    };
  }

  // Increment request count
  rateLimitData[userIp].requestCount++;

  // Check if user has exceeded request limit
  if (rateLimitData[userIp].requestCount > MAX_REQUESTS_PER_MINUTE) {
    return res.status(429).json({
      status: 'error',
      message: 'Too many requests, please try again later.'
    });
  }

  // Reset request count after 1 minute
  setTimeout(() => {
    rateLimitData[userIp].requestCount--;
  }, 60000);

  next();
};

module.exports = rateLimit;
