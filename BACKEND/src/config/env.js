import dotenv from 'dotenv';
dotenv.config();

const required = [
  'MONGODB_URI',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'ENCRYPTION_KEY',
];

const parseTimeWindow = (key, fallback) => {
  const value = process.env[key] || fallback;
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) {
    throw new Error(`❌ ${key} must use HH:mm 24-hour format`);
  }
  return value;
};

const actionPlanStart = parseTimeWindow('ACTION_PLAN_WINDOW_START', '08:00');
const actionPlanEnd = parseTimeWindow('ACTION_PLAN_WINDOW_END', '11:00');
const workDoneStart = parseTimeWindow('WORK_DONE_WINDOW_START', '17:00');
const workDoneEnd = parseTimeWindow('WORK_DONE_WINDOW_END', '22:00');

const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

if (timeToMinutes(actionPlanStart) >= timeToMinutes(actionPlanEnd)) {
  throw new Error('❌ ACTION_PLAN_WINDOW_END must be later than ACTION_PLAN_WINDOW_START');
}
if (timeToMinutes(workDoneStart) >= timeToMinutes(workDoneEnd)) {
  throw new Error('❌ WORK_DONE_WINDOW_END must be later than WORK_DONE_WINDOW_START');
}

required.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`❌ Missing required env variable: ${key}`);
  }
});

if (process.env.ENCRYPTION_KEY.length !== 32) {
  throw new Error('❌ ENCRYPTION_KEY must be exactly 32 characters');
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT: {
    ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
    REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    ACCESS_EXPIRY: process.env.JWT_ACCESS_EXPIRY || '15m',
    REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '7d',
  },
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
  CLOUDINARY: {
    CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    API_KEY: process.env.CLOUDINARY_API_KEY,
    API_SECRET: process.env.CLOUDINARY_API_SECRET,
  },
  CLIENT_URL: (process.env.CLIENT_URL || 'http://localhost:3000').split(','),
  RATE_LIMIT: {
    WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
    MAX: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  },
  SUBMISSION_WINDOWS: {
    ACTION_PLAN: { start: actionPlanStart, end: actionPlanEnd },
    WORK_DONE: { start: workDoneStart, end: workDoneEnd },
    TIME_ZONE: 'Asia/Kolkata',
  },
  IS_PROD: process.env.NODE_ENV === 'production',
};