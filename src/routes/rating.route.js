import express from 'express';
import { getRatings, upsertRating, deleteRating } from '../controllers/rating.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { validate, upsertRatingSchema } from '../middleware/validation.middleware.js';

const router = express.Router();

router.get('/', getRatings);

router.post('/', authenticateUser, validate(upsertRatingSchema), upsertRating);
router.delete('/:product_id', authenticateUser, deleteRating);

export default router;
