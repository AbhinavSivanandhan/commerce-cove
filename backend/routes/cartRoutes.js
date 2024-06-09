import express from 'express';
import { addToCart, viewCart, checkoutCart } from '../controllers/cartController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/add', authMiddleware(['customer']), addToCart);
router.get('/view', authMiddleware(['customer']), viewCart);
router.post('/checkout', authMiddleware(['customer']), checkoutCart);

export default router;
