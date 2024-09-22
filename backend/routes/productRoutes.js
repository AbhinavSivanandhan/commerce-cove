import express from 'express';
import { createProductController, updateProductController, deleteProductController, getProductByIdController, getAllProductsController,deleteProductImage, generatePresignedUrl } from '../controllers/productController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { validateProduct } from '../middleware/validationMiddleware.js';
import { addImagesToProduct } from '../controllers/productController.js';

const router = express.Router();

router.post('/', authMiddleware(['admin']), validateProduct, createProductController);
router.put('/', authMiddleware(['admin']), validateProduct, updateProductController);
router.delete('/:id', authMiddleware(['admin']), deleteProductController);
router.get('/:id', getProductByIdController);
router.get('/', getAllProductsController);
router.post('/:id/images', authMiddleware(['admin']), addImagesToProduct);
router.delete('/:id/images', authMiddleware(['admin']), deleteProductImage);
router.post('/s3-presigned-url', generatePresignedUrl);

export default router;
