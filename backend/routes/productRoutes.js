import express from 'express';
import { createProductController, updateProductController, deleteProductController, getProductByIdController, getAllProductsController } from '../controllers/productController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { validateProduct } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware(['admin']), validateProduct, createProductController);
router.put('/', authMiddleware(['admin']), validateProduct, updateProductController);
router.delete('/:id', authMiddleware(['admin']), deleteProductController);
router.get('/:id', getProductByIdController);
router.get('/', getAllProductsController);

export default router;
