import express from 'express';
import { registerUser, loginUser, getStatus, verifyEmail } from '../controllers/accountController.js';
import { validateRegister, validateLogin } from '../middleware/validationMiddleware.js';
import { rateLimitMiddleware } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

router.post('/register', validateRegister, rateLimitMiddleware(200, 3600, 10000), registerUser);
router.get('/verify-email', rateLimitMiddleware(200, 3600, 10000), verifyEmail);
router.post('/login', validateLogin, rateLimitMiddleware(200, 3600, 10000), loginUser);
router.get('/status', rateLimitMiddleware(200, 3600, 10000), getStatus);
router.post('/logout', rateLimitMiddleware(200, 3600, 10000), (req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'Strict', secure: false });
  res.clearCookie('role', { httpOnly: true, sameSite: 'Strict', secure: false });
  res.status(200).json({ message: 'Logout successful' });
});

export default router;
