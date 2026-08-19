import express from 'express';
import { getReviews, createReview, updateReview, deleteReview } from '../controllers/review.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { validate, createReviewSchema, updateReviewSchema } from '../middleware/validation.middleware.js';

const router = express.Router();

router.get('/', getReviews);

router.post('/', authenticateUser, validate(createReviewSchema), createReview);
router.patch('/:id', authenticateUser, validate(updateReviewSchema), updateReview);
router.delete('/:id', authenticateUser, deleteReview);

export default router;
