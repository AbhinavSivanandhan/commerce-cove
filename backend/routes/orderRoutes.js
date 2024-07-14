import express from 'express';
import { checkoutCart, getMyOrdersController, getOrderByIdController,updateOrderStatusController } from '../controllers/orderController.js'; //getAllOrdersController
import authMiddleware from '../middleware/authMiddleware.js';
import { validateOrder } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.post('/checkout', authMiddleware(['customer']), validateOrder, checkoutCart);
// router.get('/', authMiddleware(['customer']), viewCart);
//router.get('/', authMiddleware(['customer']), getAllOrdersController); archived for now, make available to admins
router.get('/myOrders', authMiddleware(['customer']), getMyOrdersController);
router.get('/:id', authMiddleware(['customer']), getOrderByIdController);
router.put('/updateStatus',authMiddleware(['customer']),updateOrderStatusController);
export default router;
