import Cart from '../models/cart.model.js';
import Order from '../models/order.model.js';
import Product from '../models/product.model.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const getOrCreateCart = async (userId) => {
    let cart = await Cart.findOne({ user: userId });
    if (!cart) cart = await Cart.create({ user: userId, items: [] });
    return cart;
};

const sameVariation = (a, b) => {
    if (!a && !b) return true;
    if (!a || !b) return false;
    return a.color_index === b.color_index && a.size_index === b.size_index;
};

// @route   GET /api/carts
// @access  Authenticated user
export const getCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    res.status(200).json({ success: true, cart: cart || { user: req.user._id, items: [], note: '' } });
});

// @route   POST /api/carts — add an item, or update its quantity if the same
// product+variation is already in the cart
// @access  Authenticated user
export const addOrUpdateItem = asyncHandler(async (req, res) => {
    const { product_id, quantity, has_variation, variation } = req.body;

    const product = await Product.findById(product_id);
    if (!product) {
        throw new ApiError(404, 'Product not found');
    }

    const cart = await getOrCreateCart(req.user._id);
    const existing = cart.items.find(
        (item) => item.product.toString() === product_id && sameVariation(item.variation, variation)
    );

    if (existing) {
        existing.quantity = quantity;
    } else {
        cart.items.push({ product: product_id, quantity, has_variation: !!has_variation, variation });
    }

    await cart.save();
    res.status(201).json({ success: true, cart });
});

// @route   POST /api/carts/set-note
// @access  Authenticated user
export const setNote = asyncHandler(async (req, res) => {
    const cart = await getOrCreateCart(req.user._id);
    cart.note = req.body.note || '';
    await cart.save();
    res.status(200).json({ success: true, cart });
});

// @route   POST /api/carts/checkout — snapshots cart items into an Order, then clears the cart
// @access  Authenticated user
export const checkout = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
        throw new ApiError(400, 'Cart is empty');
    }

    const orderItems = cart.items.map((item) => ({
        product: item.product._id,
        merchant: item.product.merchant,
        title: item.product.title,
        unit_price: item.product.price,
        quantity: item.quantity,
        has_variation: item.has_variation,
        variation: item.variation,
    }));

    const total = orderItems.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);

    const order = await Order.create({
        user: req.user._id,
        items: orderItems,
        note: cart.note,
        total,
    });

    cart.items = [];
    cart.note = '';
    await cart.save();

    res.status(201).json({ success: true, order });
});

// @route   DELETE /api/carts
// @access  Authenticated user
export const clearCart = asyncHandler(async (req, res) => {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], note: '' });
    res.status(200).json({ success: true, message: 'Cart cleared' });
});

// @route   DELETE /api/carts/items/:product_id
// @access  Authenticated user
export const removeCartItem = asyncHandler(async (req, res) => {
    const { product_id } = req.params;
    const { color_index, size_index } = req.query;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        throw new ApiError(404, 'Cart not found');
    }

    const initialLength = cart.items.length;

    cart.items = cart.items.filter((item) => {
        const isMatch = item.product.toString() === product_id;
        if (!isMatch) return true; // Keep items of other products

        // If specific variation query parameters are provided, match them
        if (color_index !== undefined || size_index !== undefined) {
            const itemColor = item.variation?.color_index;
            const itemSize = item.variation?.size_index;
            
            const matchColor = color_index !== undefined ? String(itemColor) === String(color_index) : true;
            const matchSize = size_index !== undefined ? String(itemSize) === String(size_index) : true;

            return !(matchColor && matchSize); // filter out if both match
        }

        // If no variation parameters are provided, filter out all items of this product
        return false;
    });

    if (cart.items.length === initialLength) {
        throw new ApiError(404, 'Item not found in cart');
    }

    await cart.save();
    res.status(200).json({ success: true, cart });
});
