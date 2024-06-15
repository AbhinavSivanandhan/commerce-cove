import express from 'express';
import { registerUser, loginUser, getStatus } from '../controllers/accountController.js';
import { validateRegister, validateLogin } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, loginUser);
router.get('/status', getStatus);
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout successful' });
});//i guess this isn't being used since login page directly removed token when button triggers handleLogout

export default router;
