import express from 'express';
import { getLikes, createLike, deleteLike } from '../controllers/like.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { validate, createLikeSchema } from '../middleware/validation.middleware.js';

const router = express.Router();

router.get('/', getLikes);

router.post('/', authenticateUser, validate(createLikeSchema), createLike);
router.delete('/:product_id', authenticateUser, deleteLike);

export default router;
