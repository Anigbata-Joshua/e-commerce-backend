import express from 'express';
import { getMerchantSales } from '../controllers/sales.controller.js';
import { authenticateMerchant } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authenticateMerchant, getMerchantSales);

export default router;