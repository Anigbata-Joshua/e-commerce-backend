import express from 'express';
import { getCart, addOrUpdateItem, setNote, checkout, clearCart, removeCartItem } from '../controllers/cart.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { validate, addCartItemSchema, setCartNoteSchema } from '../middleware/validation.middleware.js';

const router = express.Router();

// Every cart route is scoped to the logged-in user
router.use(authenticateUser);

router.get('/', getCart);
router.post('/', validate(addCartItemSchema), addOrUpdateItem);
router.post('/set-note', validate(setCartNoteSchema), setNote);
router.post('/checkout', checkout);
router.delete('/', clearCart);
router.delete('/items/:product_id', removeCartItem);

export default router;
