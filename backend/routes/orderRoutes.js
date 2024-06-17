import express from 'express';
import { checkoutCart, viewCart } from '../controllers/orderController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { validateOrder } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.post('/checkout', authMiddleware(['customer']), validateOrder, checkoutCart);
router.get('/', authMiddleware(['customer']), viewCart);

export default router;
