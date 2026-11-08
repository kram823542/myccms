// modules/system/system.middleware.js
import { SystemState } from './system.model.js';
import { logger } from '../../utils/logger.js';

/**
 * ✅ Blocks all non-SUPER_ADMIN traffic when system is offline.
 * Bypass paths:
 *  - /auth/login, /auth/refresh, /auth/logout (so SA can login to re-enable)
 *  - /system/* (so SA can toggle ON again)
 *  - /health, / (root)
 */
export const systemStateGuard = async (req, res, next) => {
  try {
    // Skip bypass paths
    const bypassPrefixes = [
      '/api/v1/auth/login',
      '/api/v1/auth/refresh',
      '/api/v1/auth/logout',
      '/api/v1/system',
      '/api/v1/health',
      '/health',
      '/',
    ];
    if (bypassPrefixes.some((p) => req.originalUrl.startsWith(p))) {
      return next();
    }

    const state = await SystemState.findById('singleton').lean();

    if (!state || !state.isOffline) return next();

    // System is OFFLINE — allow SUPER_ADMIN only
    const token = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : req.cookies?.accessToken;

    if (token) {
      try {
        const jwt = (await import('jsonwebtoken')).default;
        const { env } = await import('../../config/env.js');
        const decoded = jwt.verify(token, env.JWT.ACCESS_SECRET);
        if (decoded.role === 'SUPER_ADMIN') {
          return next();
        }
      } catch {
        // ignore — fall through to 503
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
    next(); // fail-open, don't block entire app on guard failure
  }
};