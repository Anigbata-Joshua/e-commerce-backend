import express from 'express';
import * as merchantController from '../controllers/merchant.controller.js';
import * as merchantAuthController from '../controllers/merchant.auth.controller.js';

import { authenticateMerchant } from '../middleware/auth.middleware.js';
import {
    validate, merchantRegisterSchema, merchantLoginSchema,
    merchantUpdateSchema, changePasswordSchema,
} from '../middleware/validation.middleware.js';

const router = express.Router();

router.post('/register', validate(merchantRegisterSchema), merchantAuthController.registerMerchant);
router.post('/login', validate(merchantLoginSchema), merchantAuthController.loginMerchant);
router.post('/refresh', merchantAuthController.refreshMerchantToken);
router.post('/logout', merchantAuthController.logoutMerchant);

// Public — storefront profile lookup, no auth required
router.get('/:id', merchantController.getMerchant);

// Authenticated merchant — every route below acts on the caller's own account
router.use(authenticateMerchant);

router.patch('/me', validate(merchantUpdateSchema), merchantController.updateMerchant);
router.patch('/me/change-password', validate(changePasswordSchema), merchantController.changeMerchantPassword);

export default router;