import jwt from 'jsonwebtoken';
import Merchant from '../models/merchant.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { env } from '../config/env.js';
import generateTokens from '../utils/generateTokens.js';
import { parseCookies, setAuthCookies, clearAuthCookies } from '../utils/cookies.js';

// @route   POST /api/merchants/register
export const registerMerchant = asyncHandler(async (req, res) => {
    const { password, ...rest } = req.body;

    const existing = await Merchant.findOne({ email: rest.email });
    if (existing) {
        throw new ApiError(409, 'An account with this email already exists');
    }

    const merchant = await Merchant.create({ ...rest, password });

    const { accessToken, refreshToken } = generateTokens(merchant._id, 'merchant');
    merchant.refreshToken = refreshToken;
    await merchant.save();

    setAuthCookies(res, 'merchant', accessToken, refreshToken);

    res.status(201).json({ success: true, merchant, accessToken, refreshToken });
});

// @route   POST /api/merchants/login
export const loginMerchant = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const merchant = await Merchant.findOne({ email }).select('+password');
    if (!merchant) {
        throw new ApiError(401, 'Invalid email or password');
    }

    const isMatch = await merchant.comparePassword(password);
    if (!isMatch) {
        throw new ApiError(401, 'Invalid email or password');
    }

    const { accessToken, refreshToken } = generateTokens(merchant._id, 'merchant');
    merchant.refreshToken = refreshToken;
    await merchant.save();

    setAuthCookies(res, 'merchant', accessToken, refreshToken);

    res.status(200).json({ success: true, merchant, accessToken, refreshToken });
});

// @route   POST /api/merchants/refresh
export const refreshMerchantToken = asyncHandler(async (req, res) => {
    let token = null;
    if (req.headers.cookie) {
        token = parseCookies(req.headers.cookie).merchantRefreshToken;
    }
    if (!token) token = req.body.refreshToken;

    if (!token) {
        throw new ApiError(401, 'Refresh token required');
    }

    let decoded;
    try {
        decoded = jwt.verify(token, env.jwtMerchantRefreshSecret);
    } catch (err) {
        throw new ApiError(401, 'Invalid or expired refresh token');
    }

    const merchant = await Merchant.findById(decoded.id).select('+refreshToken');
    if (!merchant) {
        throw new ApiError(401, 'Merchant no longer exists');
    }

    if (merchant.refreshToken !== token) {
        merchant.refreshToken = null;
        await merchant.save();
        clearAuthCookies(res, 'merchant');
        throw new ApiError(401, 'Potential token reuse detected. Access revoked. Please log in again.');
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(merchant._id, 'merchant');
    merchant.refreshToken = newRefreshToken;
    await merchant.save();

    setAuthCookies(res, 'merchant', accessToken, newRefreshToken);

    res.status(200).json({ success: true, accessToken, refreshToken: newRefreshToken });
});

// @route   POST /api/merchants/logout
export const logoutMerchant = asyncHandler(async (req, res) => {
    let token = null;
    if (req.headers.cookie) {
        token = parseCookies(req.headers.cookie).merchantRefreshToken;
    }
    if (!token) token = req.body.refreshToken;

    if (token) {
        try {
            const decoded = jwt.verify(token, env.jwtMerchantRefreshSecret);
            const merchant = await Merchant.findById(decoded.id);
            if (merchant) {
                merchant.refreshToken = null;
                await merchant.save();
            }
        } catch (err) {
            // Already invalid/expired — logging out anyway
        }
    }

    clearAuthCookies(res, 'merchant');

    res.status(200).json({ success: true, message: 'Logged out successfully' });
});