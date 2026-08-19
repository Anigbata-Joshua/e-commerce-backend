import Rating from '../models/rating.model.js';
import Product from '../models/product.model.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

// @route   GET /api/ratings?product_id=123
// @access  Public
export const getRatings = asyncHandler(async (req, res) => {
    const { product_id } = req.query;
    if (!product_id) {
        throw new ApiError(400, 'product_id is required');
    }

    const ratings = await Rating.find({ product: product_id }).sort({ createdAt: -1 });
    const average = ratings.length
        ? ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length
        : 0;

    res.status(200).json({ success: true, count: ratings.length, average, ratings });
});

// @route   POST /api/ratings — one rating per user per product; re-posting upserts it
// @access  Authenticated user
export const upsertRating = asyncHandler(async (req, res) => {
    const { product_id, text, value } = req.body;

    const product = await Product.findById(product_id);
    if (!product) {
        throw new ApiError(404, 'Product not found');
    }

    const rating = await Rating.findOneAndUpdate(
        { product: product_id, user: req.user._id },
        { text, value },
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({ success: true, rating });
});

// @route   DELETE /api/ratings/:product_id
// @access  Authenticated user
export const deleteRating = asyncHandler(async (req, res) => {
    const rating = await Rating.findOneAndDelete({
        product: req.params.product_id,
        user: req.user._id,
    });
    if (!rating) {
        throw new ApiError(404, 'Rating not found');
    }
    res.status(200).json({ success: true, message: 'Rating deleted' });
});
