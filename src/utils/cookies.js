import { env } from '../config/env.js';

export const parseCookies = (cookieHeader) => {
    const list = {};
    if (!cookieHeader) return list;
    cookieHeader.split(';').forEach((cookie) => {
        const parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });
    return list;
};

/**
 * Sets HttpOnly access/refresh cookies for a given role (e.g. 'user', 'merchant').
 * Cookie names follow the pattern `${role}AccessToken` / `${role}RefreshToken`.
 */
export const setAuthCookies = (res, role, accessToken, refreshToken) => {
    res.cookie(`${role}AccessToken`, accessToken, {
        httpOnly: true,
        secure: env.isProduction,
        sameSite: 'strict',
        maxAge: 45 * 60 * 1000, // 45 mins
    });
    res.cookie(`${role}RefreshToken`, refreshToken, {
        httpOnly: true,
        secure: env.isProduction,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
};

export const clearAuthCookies = (res, role) => {
    res.clearCookie(`${role}AccessToken`);
    res.clearCookie(`${role}RefreshToken`);
};