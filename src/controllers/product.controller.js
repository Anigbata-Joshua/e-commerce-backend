import Product from '../models/product.model.js';
import Category from '../models/category.model.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { uploadToCloudinary } from '../utils/uploadToCloudinary.js';

// @route   GET /api/products?merchant_id=&category_id=&search=&page=&limit=
// @access  Public
export const getProducts = asyncHandler(async (req, res) => {
    const { merchant_id, category_id, search, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (merchant_id) filter.merchant = merchant_id;
    if (category_id) filter.category = category_id;
    if (search) filter.$text = { $search: search };

    const products = await Product.find(filter)
        .populate('category', 'name')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));

    const total = await Product.countDocuments(filter);

    res.status(200).json({
        success: true,
        count: products.length,
        total,
        page: Number(page),
        limit: Number(limit),
        products,
    });
});

// @route   GET /api/products/:id
// @access  Public
export const getProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category', 'name');
    if (!product) {
        throw new ApiError(404, 'Product not found');
    }
    res.status(200).json({ success: true, product });
});

// @route   POST /api/products
// @access  Authenticated merchant
export const createProduct = asyncHandler(async (req, res) => {
    if (req.merchant.status !== 'approved') {
        throw new ApiError(403, 'Your account must be approved before you can create products');
    }

    // Category must belong to this merchant — prevents attaching a product
    // to another store's category.
    const category = await Category.findOne({ _id: req.body.category_id, merchant: req.merchant._id });
    if (!category) {
        throw new ApiError(404, 'Category not found for this merchant');
    }

    const { category_id, ...rest } = req.body;
    const product = await Product.create({ ...rest, category: category_id, merchant: req.merchant._id });

    res.status(201).json({ success: true, product });
});

// @route   PATCH /api/products/:id
// @access  Authenticated merchant, owner only
export const updateProduct = asyncHandler(async (req, res) => {
    const product = await Product.findOne({ _id: req.params.id, merchant: req.merchant._id });
    if (!product) {
        throw new ApiError(404, 'Product not found');
    }

    const { category_id, ...rest } = req.body;

    if (category_id) {
        const category = await Category.findOne({ _id: category_id, merchant: req.merchant._id });
        if (!category) {
            throw new ApiError(404, 'Category not found for this merchant');
        }
        product.category = category_id;
    }

    Object.assign(product, rest);
    await product.save();

    res.status(200).json({ success: true, product });
});

export const addProductImages = asyncHandler(async (req, res) => {
    const product = await Product.findOne({ _id: req.params.id, merchant: req.merchant._id });
    if (!product) {
        throw new ApiError(404, 'Product not found');
    }

    if (!req.files || req.files.length === 0) {
        throw new ApiError(400, 'No images provided');
    }

    const uploadedUrls = await Promise.all(
        req.files.map((file) => uploadToCloudinary(file.buffer))
    );

    product.images.push(...uploadedUrls);
    await product.save();

    res.status(200).json({ success: true, product });
});

// @route   DELETE /api/products/:id
// @access  Authenticated merchant, owner only
export const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findOneAndDelete({ _id: req.params.id, merchant: req.merchant._id });
    if (!product) {
        throw new ApiError(404, 'Product not found');
    }
    res.status(200).json({ success: true, message: 'Product deleted' });
});
