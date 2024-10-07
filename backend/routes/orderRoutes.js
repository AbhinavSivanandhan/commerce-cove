import express from 'express';
import { checkoutCart, getMyOrdersController, getOrderByIdController,updateOrderStatusController } from '../controllers/orderController.js'; //getAllOrdersController
import authMiddleware from '../middleware/authMiddleware.js';
import { validateOrder } from '../middleware/validationMiddleware.js';
import { rateLimitMiddleware } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

router.post('/checkout', authMiddleware(['customer']), validateOrder, rateLimitMiddleware(10, 3600, 1000), checkoutCart);
// router.get('/', authMiddleware(['customer']), viewCart);
//router.get('/', authMiddleware(['customer']), getAllOrdersController); archived for now, make available to admins
router.get('/myOrders', authMiddleware(['customer']), rateLimitMiddleware(100, 3600, 1000), getMyOrdersController);
router.get('/:id', authMiddleware(['customer']), rateLimitMiddleware(50, 3600, 1000), getOrderByIdController);
router.put('/updateStatus',authMiddleware(['customer']), rateLimitMiddleware(20, 3600, 1000), updateOrderStatusController);
export default router;
