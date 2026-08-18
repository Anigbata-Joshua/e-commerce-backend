import Category from '../models/category.model.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

// @route   GET /api/categories?merchant_id=111
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
    const { merchant_id } = req.query;
    const filter = merchant_id ? { merchant: merchant_id } : {};

    const categories = await Category.find(filter).sort({ name: 1 });
    res.status(200).json({ success: true, count: categories.length, categories });
});

// @route   POST /api/categories
// @access  Authenticated merchant
export const createCategory = asyncHandler(async (req, res) => {
    const existing = await Category.findOne({ merchant: req.merchant._id, name: req.body.name });
    if (existing) {
        throw new ApiError(409, 'You already have a category with this name');
    }

    const category = await Category.create({ ...req.body, merchant: req.merchant._id });
    res.status(201).json({ success: true, category });
});

// @route   PATCH /api/categories/:id
// @access  Authenticated merchant, owner only
export const updateCategory = asyncHandler(async (req, res) => {
    const category = await Category.findOne({ _id: req.params.id, merchant: req.merchant._id });
    if (!category) {
        throw new ApiError(404, 'Category not found');
    }

    Object.assign(category, req.body);
    await category.save();

    res.status(200).json({ success: true, category });
});

// @route   DELETE /api/categories/:id
// @access  Authenticated merchant, owner only
export const deleteCategory = asyncHandler(async (req, res) => {
    const category = await Category.findOneAndDelete({ _id: req.params.id, merchant: req.merchant._id });
    if (!category) {
        throw new ApiError(404, 'Category not found');
    }
    res.status(200).json({ success: true, message: 'Category deleted' });
});
