import express from 'express';
import { addToCart, viewCart, deleteFromCart} from '../controllers/cartController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/add', authMiddleware(['customer']), addToCart);
router.get('/view', authMiddleware(['customer']), viewCart);
// router.post('/checkout', authMiddleware(['customer']), checkoutCart);
router.delete('/delete/:product_id', authMiddleware(['customer']), deleteFromCart);

export default router;
