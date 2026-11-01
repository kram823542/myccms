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

const app = express();

app.set('trust proxy', 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: env.IS_PROD ? undefined : false,
  })
);

// ✅ FIX #20: CORS errors ab 403 return karte hain (500 nahi)
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (env.CLIENT_URL.includes(origin)) return cb(null, true);
      if (!env.IS_PROD && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return cb(null, true);
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

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// NoSQL Injection protection
app.use((req, res, next) => {
  const sanitize = (obj) => {
    if (obj && typeof obj === 'object') {
      for (const key in obj) {
        if (/^\$|\./.test(key)) {
          delete obj[key];
        } else {
          sanitize(obj[key]);
        }
      }
    }
  };
  if (req.body) sanitize(req.body);
  if (req.params) sanitize(req.params);
  next();
});

app.use(hpp());
app.use(compression());

if (!env.IS_PROD) {
  app.use(morgan('dev'));
} else {
  app.use(
    morgan('combined', {
      stream: { write: (msg) => logger.info(msg.trim()) },
    })
  );
}

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

app.use('/api', globalLimiter);

// ✅ FIX #2: Direct leaves mount HATAYA (sirf routes/index.js rakha)
// ✅ FIX #13: Route ambiguity resolved
app.use('/api/v1', routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;