import express from 'express';
import { getProducts, getProduct, createProduct, updateProduct, deleteProduct } from '../controllers/product.controller.js';
import { authenticateMerchant } from '../middleware/auth.middleware.js';
import { validate, createProductSchema, updateProductSchema } from '../middleware/validation.middleware.js';

const router = express.Router();

// Public — browse and view products
router.get('/', getProducts);
router.get('/:id', getProduct);

// Authenticated merchant — ownership checked inside the controller
router.post('/', authenticateMerchant, validate(createProductSchema), createProduct);
router.patch('/:id', authenticateMerchant, validate(updateProductSchema), updateProduct);
router.delete('/:id', authenticateMerchant, deleteProduct);

export default router;