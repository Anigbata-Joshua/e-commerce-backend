import express from 'express';
import { getMerchantSales, updateOrderStatus } from '../controllers/sales.controller.js';
import { authenticateMerchant } from '../middleware/auth.middleware.js';
import { validate, updateOrderStatusSchema } from '../middleware/validation.middleware.js';

const router = express.Router();

router.get('/', authenticateMerchant, getMerchantSales);
router.patch('/:orderId/status', authenticateMerchant, validate(updateOrderStatusSchema), updateOrderStatus);

export default router;