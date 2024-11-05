import dotenv from 'dotenv';
dotenv.config();

export const workerAuthMiddleware = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey && apiKey === process.env.WORKER_API_KEY) {
    next(); // API key is valid, proceed to the route handler
  } else {
    res.status(403).json({ message: 'Forbidden: Invalid API key' });
  }
};
