import jwt from 'jsonwebtoken';
import { SystemState } from './system.model.js';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

export const systemStateGuard = async (req, res, next) => {
  try {
    // ✅ Login aur Refresh ko hamesha allow karo (par hum inpe check lagayenge)
    const authBypass = ['/api/v1/auth/login', '/api/v1/auth/refresh', '/api/v1/auth/logout'];
    const otherBypass = ['/api/v1/system', '/api/v1/health', '/health', '/'];

    if (otherBypass.some((p) => req.originalUrl.startsWith(p))) {
      return next();
    }

    const state = await SystemState.findById('singleton').lean();

    // Agar system ON hai, toh koi problem nahi, sab jaane do
    if (!state || !state.isOffline) return next();

    // 🔴 System is OFFLINE 🔴

    // Agar ye login ya refresh route hai, toh allow karo (par baad me auth middleware handle karega)
    if (authBypass.some((p) => req.originalUrl.startsWith(p))) {
      return next();
    }

    // Baaki sabhi routes pe check karo ki user Super Admin hai ya nahi
    const token = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : req.cookies?.accessToken;

    if (token) {
      try {
        const decoded = jwt.verify(token, env.JWT.ACCESS_SECRET);
        if (decoded.role === 'SUPER_ADMIN') {
          return next(); // SA ko sab allow hai
        }
      } catch {
        // invalid token
      }
    }

    logger.warn(`🔴 Blocked ${req.method} ${req.originalUrl} — system offline`);

    return res.status(503).json({
      success: false,
      message: state.offlineMessage || 'System is under maintenance. Please try again later.',
      maintenance: true,
    });
  } catch (err) {
    logger.error(`systemStateGuard error: ${err.message}`);
    next();
  }
};