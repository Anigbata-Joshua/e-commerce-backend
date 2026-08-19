import Like from '../models/like.model.js';
import Product from '../models/product.model.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

// @route   GET /api/likes?product_id=123
// @access  Public
export const getLikes = asyncHandler(async (req, res) => {
    const { product_id } = req.query;
    if (!product_id) {
        throw new ApiError(400, 'product_id is required');
    }

    const likes = await Like.find({ product: product_id }).populate('user', 'full_name');
    res.status(200).json({ success: true, count: likes.length, likes });
});

// @route   POST /api/likes
// @access  Authenticated user
export const createLike = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.body.product_id);
    if (!product) {
        throw new ApiError(404, 'Product not found');
    }

    const existing = await Like.findOne({ product: req.body.product_id, user: req.user._id });
    if (existing) {
        throw new ApiError(409, 'Product already liked');
    }

    const like = await Like.create({ product: req.body.product_id, user: req.user._id });
    res.status(201).json({ success: true, like });
});

// @route   DELETE /api/likes/:product_id
// @access  Authenticated user
export const deleteLike = asyncHandler(async (req, res) => {
    const like = await Like.findOneAndDelete({
        product: req.params.product_id,
        user: req.user._id,
    });
    if (!like) {
        throw new ApiError(404, 'Like not found');
    }
    res.status(200).json({ success: true, message: 'Like removed' });
});
