import express from 'express';
import { createProductController, updateProductController, deleteProductController, getProductByIdController, getProductBySearchTermController, getAllProductsController,deleteProductImage, generatePresignedUrl } from '../controllers/productController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { validateProduct } from '../middleware/validationMiddleware.js';
import { addImagesToProduct } from '../controllers/productController.js';
import { rateLimitMiddleware } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware(['admin']), validateProduct, rateLimitMiddleware(50, 3600, 1000), createProductController);
router.put('/:id', authMiddleware(['admin']), validateProduct, rateLimitMiddleware(100, 3600, 1000), updateProductController);
router.delete('/:id', authMiddleware(['admin']), rateLimitMiddleware(50, 3600, 1000), deleteProductController);
router.get('/:id', rateLimitMiddleware(5000, 3600, 5000), getProductByIdController);
router.get('/search/:searchTerm', rateLimitMiddleware(5000, 3600, 5000), getProductBySearchTermController);
router.get('/', rateLimitMiddleware(5000, 3600, 5000), getAllProductsController);
router.post('/:id/images', authMiddleware(['admin']), rateLimitMiddleware(50, 3600, 1000), addImagesToProduct);
router.delete('/:id/images', authMiddleware(['admin']), rateLimitMiddleware(50, 3600, 1000), deleteProductImage);
router.post('/s3-presigned-url', rateLimitMiddleware(80, 3600, 1000), generatePresignedUrl);

export default router;
