import Review from '../models/review.model.js';
import Product from '../models/product.model.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

// @route   GET /api/reviews?product_id=123
// @access  Public
export const getReviews = asyncHandler(async (req, res) => {
    const { product_id } = req.query;
    if (!product_id) {
        throw new ApiError(400, 'product_id is required');
    }

    const reviews = await Review.find({ product: product_id })
        .populate('user', 'full_name ')
        .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reviews.length, reviews });
});

// @route   POST /api/reviews
// @access  Authenticated user
export const createReview = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.body.product_id);
    if (!product) {
        throw new ApiError(404, 'Product not found');
    }

    const review = await Review.create({
        product: req.body.product_id,
        user: req.user._id,
        text: req.body.text,
    });

    res.status(201).json({ success: true, review });
});

// @route   PATCH /api/reviews/:id
// @access  Authenticated user, author only
export const updateReview = asyncHandler(async (req, res) => {
    const review = await Review.findOne({ _id: req.params.id, user: req.user._id });
    if (!review) {
        throw new ApiError(404, 'Review not found');
    }

    review.text = req.body.text;
    await review.save();

    res.status(200).json({ success: true, review });
});

// @route   DELETE /api/reviews/:id
// @access  Authenticated user, author only
export const deleteReview = asyncHandler(async (req, res) => {
    const review = await Review.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!review) {
        throw new ApiError(404, 'Review not found');
    }
    res.status(200).json({ success: true, message: 'Review deleted' });
});
