import logger from '../utils/logger.js';

const loggingMiddleware = (req, res, next) => {
  const startTime = Date.now();

  // Listen for response finish event
  res.on('finish', () => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.originalUrl,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      statusCode: res.statusCode, // Response status code
      duration: `${Date.now() - startTime}ms`, // Time taken to process
    };

    // Include user info if available (e.g., from req.user set by auth middleware)
    if (req.user) {
      logEntry.user = {
        id: req.user.user_id,
        role: req.user.role,
      };
    }

    logger.info(logEntry);
  });

  next();
};

export default loggingMiddleware;
