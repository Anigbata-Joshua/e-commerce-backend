import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { env } from '../config/env.js';
import generateTokens from '../utils/generateTokens.js';
import { parseCookies, setAuthCookies, clearAuthCookies } from '../utils/cookies.js';

// @route   POST /api/users/register
export const registerUser = asyncHandler(async (req, res) => {
    const { password, ...rest } = req.body;

    const existing = await User.findOne({ email: rest.email });
    if (existing) {
        throw new ApiError(409, 'An account with this email already exists');
    }

    const user = await User.create({ ...rest, password });

    const { accessToken, refreshToken } = generateTokens(user._id, 'user');
    user.refreshToken = refreshToken;
    await user.save();

    setAuthCookies(res, 'user', accessToken, refreshToken);

    res.status(201).json({ success: true, user, accessToken, refreshToken });
});

// @route   POST /api/users/login
export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        throw new ApiError(401, 'Invalid email or password');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new ApiError(401, 'Invalid email or password');
    }

    const { accessToken, refreshToken } = generateTokens(user._id, 'user');
    user.refreshToken = refreshToken;
    await user.save();

    setAuthCookies(res, 'user', accessToken, refreshToken);

    res.status(200).json({ success: true, user, accessToken, refreshToken });
});

// @route   POST /api/users/refresh
export const refreshUserToken = asyncHandler(async (req, res) => {
    let token = null;
    if (req.headers.cookie) {
        token = parseCookies(req.headers.cookie).userRefreshToken;
    }
    if (!token) token = req.body.refreshToken;

    if (!token) {
        throw new ApiError(401, 'Refresh token required');
    }

    let decoded;
    try {
        decoded = jwt.verify(token, env.jwtUserRefreshSecret);
    } catch (err) {
        throw new ApiError(401, 'Invalid or expired refresh token');
    }

    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user) {
        throw new ApiError(401, 'User no longer exists');
    }

    if (user.refreshToken !== token) {
        user.refreshToken = null;
        await user.save();
        clearAuthCookies(res, 'user');
        throw new ApiError(401, 'Potential token reuse detected. Access revoked. Please log in again.');
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id, 'user');
    user.refreshToken = newRefreshToken;
    await user.save();

    setAuthCookies(res, 'user', accessToken, newRefreshToken);

    res.status(200).json({ success: true, accessToken, refreshToken: newRefreshToken });
});

// @route   POST /api/users/logout
export const logoutUser = asyncHandler(async (req, res) => {
    let token = null;
    if (req.headers.cookie) {
        token = parseCookies(req.headers.cookie).userRefreshToken;
    }
    if (!token) token = req.body.refreshToken;

    if (token) {
        try {
            const decoded = jwt.verify(token, env.jwtUserRefreshSecret);
            const user = await User.findById(decoded.id);
            if (user) {
                user.refreshToken = null;
                await user.save();
            }
        } catch (err) {
            // Already invalid/expired — logging out anyway
        }
    }

    clearAuthCookies(res, 'user');

    res.status(200).json({ success: true, message: 'Logged out successfully' });
});