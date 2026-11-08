import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import morgan from 'morgan';
import hpp from 'hpp';

import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import routes from './routes/index.js';
import { globalLimiter } from './middlewares/rateLimit.middleware.js';
import { notFoundHandler, errorHandler } from './middlewares/error.middleware.js';
import { systemStateGuard } from './modules/system/system.middleware.js';

const app = express();

app.set('trust proxy', 1);

/* ═══════════════════════════════════════════════
   1. SECURITY HEADERS
   ═══════════════════════════════════════════════ */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'same-origin' },
    contentSecurityPolicy: env.IS_PROD ? undefined : false,
  })
);

/* ═══════════════════════════════════════════════
   2. CORS
   ═══════════════════════════════════════════════ */
const allowedOrigins = new Set(
  [...(env.CLIENT_URL || []), 'http://localhost:3000', 'http://127.0.0.1:3000']
    .filter(Boolean)
    .map((origin) => origin.trim())
);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.has(origin)) return cb(null, true);
      if (!env.IS_PROD && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return cb(null, true);
      }
      logger.warn(`🚫 CORS blocked origin: ${origin}`);
      const err = new Error(`CORS blocked: ${origin}`);
      err.statusCode = 403;
      err.isOperational = true;
      return cb(err, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Length', 'X-Total-Count'],
    maxAge: 86400,
  })
);

/* ═══════════════════════════════════════════════
   3. BODY PARSERS — SINGLE MOUNT with unified limits
   ═══════════════════════════════════════════════ */
// ✅ 200MB for backup restore — generous but safe
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ extended: true, limit: '200mb' }));
app.use(cookieParser());

/* ═══════════════════════════════════════════════
   4. NoSQL INJECTION SANITIZER (POST-parse)
   ═══════════════════════════════════════════════ */
const sanitizeData = (obj, depth = 0) => {
  // Guard: max recursion depth
  if (depth > 20) return;

  if (obj === null || obj === undefined) return;
  if (typeof obj !== 'object') return;

  // ✅ Skip Buffer, Date, RegExp, ObjectId, Mongo ObjectId
  if (
    Buffer.isBuffer(obj) ||
    obj instanceof Date ||
    obj instanceof RegExp ||
    obj?._bsontype === 'ObjectId'
  ) {
    return;
  }

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      sanitizeData(obj[i], depth + 1);
    }
    return;
  }

  for (const key of Object.keys(obj)) {
    // ✅ Block keys starting with $ or containing .
    if (/^\$|\./.test(key)) {
      delete obj[key];
    } else {
      sanitizeData(obj[key], depth + 1);
    }
  }
};

app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') sanitizeData(req.body);
  if (req.query && typeof req.query === 'object') sanitizeData(req.query);
  if (req.params && typeof req.params === 'object') sanitizeData(req.params);
  next();
});

/* ═══════════════════════════════════════════════
   5. HTTP HARDENING
   ═══════════════════════════════════════════════ */
app.use(hpp());
app.use(compression());

/* ═══════════════════════════════════════════════
   6. LOGGING
   ═══════════════════════════════════════════════ */
if (!env.IS_PROD) {
  app.use(morgan('dev'));
} else {
  app.use(
    morgan('combined', {
      stream: { write: (msg) => logger.info(msg.trim()) },
    })
  );
}

/* ═══════════════════════════════════════════════
   7. HEALTH & ROOT (mounted BEFORE system guard)
   ═══════════════════════════════════════════════ */
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'OK',
    message: 'CLF Portal Backend API is running successfully!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is healthy' });
});

app.get('/favicon.ico', (req, res) => res.status(204).end());

/* ═══════════════════════════════════════════════
   8. SYSTEM STATE GUARD (blocks all non-SA when OFF)
      ⚠️ Must be BEFORE /api routes but AFTER health
   ═══════════════════════════════════════════════ */
app.use(systemStateGuard);

/* ═══════════════════════════════════════════════
   9. RATE LIMIT + API ROUTES
   ═══════════════════════════════════════════════ */
app.use('/api', globalLimiter);
app.use('/api/v1', routes);

/* ═══════════════════════════════════════════════
   10. ERROR HANDLERS (must be LAST)
   ═══════════════════════════════════════════════ */
app.use(notFoundHandler);
app.use(errorHandler);

export default app;