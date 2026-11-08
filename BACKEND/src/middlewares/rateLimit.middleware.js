import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

export const globalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT.WINDOW_MS || 15 * 60 * 1000,
  max: env.IS_PROD ? 2000 : 10000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    const path = req.path || req.url || '';

    // ✅ केवल नोटिफिकेशन्स पोलिंग और हेल्थ/फेविकॉन चेक को ही स्किप करें, सभी GET को नहीं!
    if (path.includes('/notifications') || path.includes('/health') || path.includes('/favicon.ico')) {
      return true;
    }

    return false;
  },
  message: { success: false, message: 'Too many requests, please try again later.' },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.IS_PROD ? 10 : 100,
  skipSuccessfulRequests: true,
  message: { success: false, message: 'Too many login attempts, try again in 15 min.' },
});

export const submissionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { success: false, message: 'Too many submissions, slow down.' },
});