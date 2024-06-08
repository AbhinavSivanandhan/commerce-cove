import express from 'express';
import { createProductController, updateProductController, deleteProductController, getProductByIdController, getAllProductsController } from '../controllers/productController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware(['admin']), createProductController);
router.put('/', authMiddleware(['admin']), updateProductController);
router.delete('/:id', authMiddleware(['admin']), deleteProductController);
router.get('/:id', getProductByIdController);
router.get('/', getAllProductsController);

export default router;
