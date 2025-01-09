import express from 'express';
import { registerUser, loginUser, getStatus } from '../controllers/accountController.js';
import { validateRegister, validateLogin } from '../middleware/validationMiddleware.js';
import { rateLimitMiddleware } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

router.post('/register', validateRegister, rateLimitMiddleware(200, 3600, 10000), registerUser);
router.post('/login', validateLogin, rateLimitMiddleware(200, 3600, 10000), loginUser);
router.get('/status', rateLimitMiddleware(200, 3600, 10000), getStatus);
router.post('/logout', rateLimitMiddleware(200, 3600, 10000), (req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'Strict', secure: process.env.NODE_ENV === 'production' });
  res.clearCookie('role', { httpOnly: true, sameSite: 'Strict', secure: process.env.NODE_ENV === 'production' });
  res.status(200).json({ message: 'Logout successful' });
});

export default router;
