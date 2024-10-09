import express from 'express';
import { addToCart, viewCart, deleteFromCart} from '../controllers/cartController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { rateLimitMiddleware } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

router.post('/add', authMiddleware(['customer']), rateLimitMiddleware(1000, 3600, 5000), addToCart);
router.get('/view', authMiddleware(['customer']), rateLimitMiddleware(500, 3600, 5000), viewCart);
// router.post('/checkout', authMiddleware(['customer']), checkoutCart);
router.delete('/delete/:product_id', authMiddleware(['customer']), rateLimitMiddleware(50, 3600, 5000), deleteFromCart);

export default router;
