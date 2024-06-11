import express from 'express';
import { checkoutCart, viewCart } from '../controllers/orderController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/checkout', authMiddleware(['customer']), checkoutCart);
router.get('/', authMiddleware(['customer']), viewCart);

export default router;
