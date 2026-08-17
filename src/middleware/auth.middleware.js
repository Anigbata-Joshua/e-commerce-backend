import jwt from 'jsonwebtoken';
import Merchant from '../models/merchant.model.js';
import User from '../models/user.model.js';
import { env } from '../config/env.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';

const parseCookies = (cookieHeader) => {
    const list = {};
    if (!cookieHeader) return list;

    cookieHeader.split(';').forEach((cookie) => {
        const parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });
    return list;
};

// Shared factory: builds an authenticate middleware for either domain
// ('merchant' or 'user'), each reading its own cookie name and JWT secret
// so a token from one domain is never accepted on the other's routes.
const buildAuthenticate = ({ domain, cookieName, secret, Model, reqKey }) =>
    asyncHandler(async (req, res, next) => {
        let token = null;

        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        } else if (req.headers.cookie) {
            const cookies = parseCookies(req.headers.cookie);
            if (cookies[cookieName]) {
                token = cookies[cookieName];
            }
        }

        if (!token) {
            throw new ApiError(401, 'No token provided, authorization denied');
        }

        let decoded;
        try {
            decoded = jwt.verify(token, secret);
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                throw new ApiError(401, `${domain} access token expired`);
            }
            throw new ApiError(401, 'Invalid token');
        }

        const account = await Model.findById(decoded.id);
        if (!account) {
            throw new ApiError(401, `${domain} no longer exists`);
        }

        req[reqKey] = account;
        next();
    });

export const authenticateMerchant = buildAuthenticate({
    domain: 'Merchant',
    cookieName: 'merchantAccessToken',
    secret: env.jwtMerchantAccessSecret,
    Model: Merchant,
    reqKey: 'merchant',
});

export const authenticateUser = buildAuthenticate({
    domain: 'User',
    cookieName: 'userAccessToken',
    secret: env.jwtUserAccessSecret,
    Model: User,
    reqKey: 'user',
});
