import express from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/category.controller.js';
import { authenticateMerchant } from '../middleware/auth.middleware.js';
import { validate, createCategorySchema, updateCategorySchema } from '../middleware/validation.middleware.js';

const router = express.Router();

// Public — browse a merchant's categories
router.get('/', getCategories);

// Authenticated merchant — ownership checked inside the controller
router.post('/', authenticateMerchant, validate(createCategorySchema), createCategory);
router.patch('/:id', authenticateMerchant, validate(updateCategorySchema), updateCategory);
router.delete('/:id', authenticateMerchant, deleteCategory);

export default router;