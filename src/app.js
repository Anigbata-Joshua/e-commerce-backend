import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import errorHandler from './middleware/error.middleware.js';
import { sanitizeBody } from './utils/sanitize.js';
import userRoutes from './routes/user.route.js';
import merchantRoutes from './routes/merchant.route.js';
import categoryRoutes from './routes/category.route.js';

const app = express();

// Security & core middleware
app.use(helmet());
app.use(cors({
    origin: env.corsOrigins.length > 0 ? env.corsOrigins : env.frontendURI,
    credentials: true,
}));

// Health check — placed BEFORE rate limiters so monitoring/uptime pings
// can never be blocked by rate limiting, regardless of frequency.
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'E-commerce API is running!',
        environment: env.nodeEnv,
        isProduction: env.isProduction,
    });
});

// General rate limiter — applies broadly across the whole API
const generalLimiter = rateLimit({
    windowMs: env.rateLimit,
    max: env.generalRateLimitMax,
});
app.use('/api', generalLimiter);

// Stricter rate limiter on merchant/user auth routes specifically
const authLimiter = rateLimit({
    windowMs: env.rateLimit,
    max: env.rateLimitMax,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/merchants/register', authLimiter);
app.use('/api/merchants/login', authLimiter);
app.use('/api/users/register', authLimiter);
app.use('/api/users/login', authLimiter);
app.use('/api/categories', categoryRoutes);
app.use('/api/categories', categoryRoutes);


app.use(express.json());
app.use(sanitizeBody);

// 📍 API Routes
app.use('/api/users', userRoutes);
app.use('/api/merchants', merchantRoutes);

app.use(errorHandler); // must be last

export default app;