import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

// domain: 'merchant' | 'user' — selects which secret pair to sign with,
// so a merchant's token can never be verified against user routes.
const SECRETS = {
    merchant: {
        access: env.jwtMerchantAccessSecret,
        accessExpiresIn: env.jwtMerchantAccessExpiresIn,
        refresh: env.jwtMerchantRefreshSecret,
        refreshExpiresIn: env.jwtMerchantRefreshExpiresIn,
    },
    user: {
        access: env.jwtUserAccessSecret,
        accessExpiresIn: env.jwtUserAccessExpiresIn,
        refresh: env.jwtUserRefreshSecret,
        refreshExpiresIn: env.jwtUserRefreshExpiresIn,
    },
};

const generateTokens = (id, domain) => {
    const secrets = SECRETS[domain];
    if (!secrets) throw new Error(`Unknown token domain: ${domain}`);

    const accessToken = jwt.sign({ id }, secrets.access, { expiresIn: secrets.accessExpiresIn });
    const refreshToken = jwt.sign({ id }, secrets.refresh, { expiresIn: secrets.refreshExpiresIn });

    return { accessToken, refreshToken };
};

export default generateTokens;