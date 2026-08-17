import express from 'express';
import * as userController from '../controllers/user.controller.js';
import * as authController from '../controllers/auth.controller.js';

import { authenticateUser } from '../middleware/auth.middleware.js';
import {
    validate, userRegisterSchema, userLoginSchema,
    userUpdateSchema, changePasswordSchema,
} from '../middleware/validation.middleware.js';

const router = express.Router();

router.post('/register', validate(userRegisterSchema), authController.registerUser);
router.post('/login', validate(userLoginSchema), authController.loginUser);
router.post('/refresh', authController.refreshUserToken);
router.post('/logout', authController.logoutUser);

// Authenticated user — every route below acts on the caller's own account
router.use(authenticateUser);

router.patch('/me', validate(userUpdateSchema), userController.updateUser);
router.patch('/me/change-password', validate(changePasswordSchema), userController.changeUserPassword);
// router.get('/me/orders', userController.getUserOrders);
// router.get('/me/reviews', userController.getUserReviews);
// router.get('/me/ratings', userController.getUserRatings);
// router.get('/me/likes', userController.getUserRatings);

export default router;