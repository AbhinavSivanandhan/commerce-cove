import express from 'express';
import { registerUser, loginUser, getStatus } from '../controllers/accountController.js';
import { validateRegister, validateLogin } from '../middleware/validationMiddleware.js';
import { rateLimitMiddleware } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

router.post('/register', validateRegister, rateLimitMiddleware(200, 3600, 10000), registerUser);
router.post('/login', validateLogin, rateLimitMiddleware(200, 3600, 10000), loginUser);
router.get('/status', rateLimitMiddleware(200, 3600, 10000), getStatus);
router.post('/logout', rateLimitMiddleware(200, 3600, 10000), (req, res) => {
  res.json({ message: 'Logout successful' });
});//i guess this isn't being used since login page directly removed token when button triggers handleLogout

export default router;
