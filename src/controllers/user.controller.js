import User from '../models/user.model.js';
// import Order from '../models/order.model.js';
// import Review from '../models/review.model.js';
// import Rating from '../models/rating.model.js';
// import Like from '../models/like.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';

// @route   PATCH /api/users/me
export const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(req.user._id, req.body, {
        new: true,
        runValidators: true,
    });
    res.status(200).json({ success: true, user });
});

// @route   PATCH /api/users/me/change-password
export const changeUserPassword = asyncHandler(async (req, res) => {
    const { old_password, new_password } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(old_password);
    if (!isMatch) {
        throw new ApiError(401, 'Old password is incorrect');
    }

    user.password = new_password;
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
});

// @route   GET /api/users/me/orders
// export const getUserOrders = asyncHandler(async (req, res) => {
//     const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
//     res.status(200).json({ success: true, count: orders.length, orders });
// });

// // @route   GET /api/users/me/reviews
// export const getUserReviews = asyncHandler(async (req, res) => {
//     const reviews = await Review.find({ user: req.user._id }).sort({ createdAt: -1 });
//     res.status(200).json({ success: true, count: reviews.length, reviews });
// });

// // @route   GET /api/users/me/ratings
// export const getUserRatings = asyncHandler(async (req, res) => {
//     const ratings = await Rating.find({ user: req.user._id }).sort({ createdAt: -1 });
//     res.status(200).json({ success: true, count: ratings.length, ratings });
// });

// // @route   GET /api/users/me/likes
// export const getUserLikes = asyncHandler(async (req, res) => {
//     const likes = await Like.find({ user: req.user._id }).populate('product');
//     res.status(200).json({ success: true, count: likes.length, likes });
// });