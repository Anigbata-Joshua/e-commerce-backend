import 'dotenv/config';

const required = (key, fallback = undefined) => {
    const value = process.env[key] ?? fallback;

    if (value === undefined) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
};

export const env = {

    // Server
    nodeEnv: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',
    port: parseInt(process.env.PORT || '4000', 10),

    // Database
    mongoUri: required('MONGODB_URI'),

    // Cloudinary
    cloudinaryCloudName: required('CLOUDINARY_CLOUD_NAME'),
    cloudinaryApiKey: required('CLOUDINARY_API_KEY'),
    cloudinaryApiSecret: required('CLOUDINARY_API_SECRET'),

    // Frontend & CORS
    frontendURI: process.env.FRONTEND_URI || 'http://localhost:5173',
    corsOrigins: (process.env.CORS_ORIGIN || '').split(',').map((o) => o.trim()).filter(Boolean),

    // JWT — merchants and users each get their own secret pair so a token
    // issued to one can never be replayed against the other's routes.
    jwtMerchantAccessSecret: required('JWT_MERCHANT_ACCESS_SECRET'),
    jwtMerchantAccessExpiresIn: process.env.JWT_MERCHANT_ACCESS_EXPIRATION || '45m',
    jwtMerchantRefreshSecret: required('JWT_MERCHANT_REFRESH_SECRET'),
    jwtMerchantRefreshExpiresIn: process.env.JWT_MERCHANT_REFRESH_EXPIRATION || '7d',

    jwtUserAccessSecret: required('JWT_USER_ACCESS_SECRET'),
    jwtUserAccessExpiresIn: process.env.JWT_USER_ACCESS_EXPIRATION || '45m',
    jwtUserRefreshSecret: required('JWT_USER_REFRESH_SECRET'),
    jwtUserRefreshExpiresIn: process.env.JWT_USER_REFRESH_EXPIRATION || '7d',

    // Rate limiter
    rateLimit: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    generalRateLimitMax: parseInt(process.env.GENERAL_RATE_LIMIT_MAX || '300', 10),
};
