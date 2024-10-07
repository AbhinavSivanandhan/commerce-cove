import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

// Create Redis client using async connect method
const redisClient = createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});


// Handle Redis connection error events
redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

// Async function to connect the Redis client
(async () => {
  try {
    await redisClient.connect();
    console.log('Redis client connected successfully');
  } catch (err) {
    console.error('Failed to connect to Redis:', err);
    process.exit(1); // Gracefully shut down the app if Redis can't connect
  }
})();

// Middleware factory to create rate limiter for a specific route
export const rateLimitMiddleware = (limit, windowInSeconds = 3600, globalLimit = null) => {
  return async (req, res, next) => {
    const method = req.method;
    const routePath = req.route.path; // Use the route path to create unique rate limit per route

    try {
      // Use username if authenticated, fallback to IP if user is not authenticated
      const username = req.user ? req.user.username : req.ip;
      const userKey = `ratelimit:${username}:${routePath}:${method}`; // Unique Redis key for this user and route

      // Get the current request count for this user on this route
      let requestCount = await redisClient.get(userKey);
      requestCount = requestCount ? parseInt(requestCount) : 0;

      // If the user has exceeded their limit for this route, block the request
      if (requestCount >= limit) {
        return res.status(429).json({ message: `Too many ${method} requests on ${routePath}. Please try again later.` });
      }

      // Increment user request count and set expiration for the window
      await redisClient.incr(userKey);
      await redisClient.expire(userKey, windowInSeconds); // Set expiration for the rate limit window

      // Optional: Handle global rate limiting across the entire app
      if (globalLimit) {
        const globalKey = 'global:rate-limit';
        let globalCount = await redisClient.get(globalKey);
        globalCount = globalCount ? parseInt(globalCount) : 0;

        if (globalCount >= globalLimit) {
          return res.status(503).json({ message: 'App is temporarily down due to increasing server costs. Please try again later.' });
        }

        await redisClient.incr(globalKey);
        await redisClient.expire(globalKey, windowInSeconds); // Set expiration for the global rate limit window
      }

      next(); // Continue to the next middleware or route handler

    } catch (error) {
      // Critical error handling: Fail the request and send the shutdown response
      console.error('Critical error in rate limiter:', error);
      
      // Sending a 500 error response to indicate the failure and stop app requests
      return res.status(500).json({ message: 'Oh no, there seems to be something suspicious going on. The app is shutting down.' });
      // Graceful error handling: Log error but allow the request to proceed
      //console.error('Error in rate limiter:', error);
      //next();
    }
  };
};
