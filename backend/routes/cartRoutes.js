import express from 'express';
import { addToCart, viewCart, deleteFromCart} from '../controllers/cartController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { rateLimitMiddleware } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

router.post('/add', authMiddleware(['customer']), rateLimitMiddleware(200, 3600, 1000), addToCart);
router.get('/view', authMiddleware(['customer']), rateLimitMiddleware(50, 3600, 1000), viewCart);
// router.post('/checkout', authMiddleware(['customer']), checkoutCart);
router.delete('/delete/:product_id', authMiddleware(['customer']), rateLimitMiddleware(50, 3600, 1000), deleteFromCart);

export default router;
