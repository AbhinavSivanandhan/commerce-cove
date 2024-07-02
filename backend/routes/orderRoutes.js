import express from 'express';
import { checkoutCart, getAllOrdersController, getOrderByIdController,updateOrderStatusController } from '../controllers/orderController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { validateOrder } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.post('/checkout', authMiddleware(['customer']), validateOrder, checkoutCart);
// router.get('/', authMiddleware(['customer']), viewCart);
router.get('/', authMiddleware(['customer']), getAllOrdersController);
router.get('/:id', authMiddleware(['customer']), getOrderByIdController);
router.put('/updateStatus',authMiddleware(['customer']),updateOrderStatusController);
export default router;
