import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { User } from '../users/user.model.js';
import { Employee } from '../employees/employee.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { createAudit } from '../../middlewares/audit.middleware.js';
import { logger } from '../../utils/logger.js';
import { SystemState } from '../system/system.model.js'; // ✅ Import SystemState for Maintenance check

const MAX_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000;

// ✅ FIX #21: Failed login audit throttle (DOS prevention)
const auditThrottle = new Map();
const AUDIT_THROTTLE_MS = 60 * 1000; // 1 minute per username

const shouldAuditFail = (username) => {
  const now = Date.now();
  const last = auditThrottle.get(username);
  if (last && now - last < AUDIT_THROTTLE_MS) return false;
  auditThrottle.set(username, now);
  // Cleanup old entries every 1000 inserts
  if (auditThrottle.size > 1000) {
    for (const [k, v] of auditThrottle) {
      if (now - v > AUDIT_THROTTLE_MS) auditThrottle.delete(k);
    }
  }
  return true;
};

const signAccess = (user) =>
  jwt.sign(
    { sub: user._id, role: user.role, blockId: user.blockId, clfId: user.clfId },
    env.JWT.ACCESS_SECRET,
    { expiresIn: env.JWT.ACCESS_EXPIRY }
  );

const signRefresh = (user) =>
  jwt.sign({ sub: user._id }, env.JWT.REFRESH_SECRET, {
    expiresIn: env.JWT.REFRESH_EXPIRY,
  });

const resolveEmployeeId = async (user) => {
  if (user.role !== 'EMPLOYEE') return null;
  if (user.employeeId) return String(user.employeeId);
  const emp = await Employee.findOne({ userId: user._id }).select('_id');
  if (!emp) return null;
  user.employeeId = emp._id;
  await user.save();
  return String(emp._id);
};

const buildUserPayload = async (user) => {
  const employeeId = await resolveEmployeeId(user);
  let email = user.email || '';
  let mobile = user.mobile || '';

  if (user.role === 'EMPLOYEE' && employeeId) {
    try {
      const emp = await Employee.findById(employeeId).select('mobile');
      if (emp?.mobile && !mobile) mobile = emp.mobile;
    } catch (e) {}
  }

  return {
    _id: user._id,
    username: user.username,
    name: user.name,
    email,
    mobile,
    role: user.role,
    blockId: user.blockId ? String(user.blockId) : null,
    clfId: user.clfId ? String(user.clfId) : null,
    employeeId,
    mustChangePassword: user.mustChangePassword,
    profilePhoto: user.profilePhoto || null,
  };
};

export const login = async (req, { username, password }) => {
  // ✅ FIX: Check if system is OFFLINE before processing login
  const systemState = await SystemState.findById('singleton').lean();
  
  const user = await User.findOne({ username: username.toLowerCase() }).select('+password');

  // If system is offline AND user is NOT Super Admin, block login
  if (systemState?.isOffline && user?.role !== 'SUPER_ADMIN') {
    throw ApiError.forbidden(systemState.offlineMessage || 'System is under maintenance. Only Super Admin can login.');
  }

  if (!user) {
    if (shouldAuditFail(username)) {
      await createAudit({ req, action: 'LOGIN_FAILED', metadata: { username, reason: 'USER_NOT_FOUND' }, status: 'FAILED' });
    }
    throw ApiError.unauthorized('Invalid credentials');
  }
  
  if (user.isLocked()) throw ApiError.forbidden('Account locked. Try again later.');
  if (user.status !== 'ACTIVE') throw ApiError.forbidden(`Account is ${user.status.toLowerCase()}`);

  const valid = await user.comparePassword(password);
  if (!valid) {
    user.loginAttempts = (user.loginAttempts || 0) + 1;
    if (user.loginAttempts >= MAX_ATTEMPTS) user.lockUntil = new Date(Date.now() + LOCK_TIME);
    await user.save();
    if (shouldAuditFail(username)) {
      await createAudit({ req, action: 'LOGIN_FAILED', metadata: { username, reason: 'INVALID_PASSWORD' }, status: 'FAILED' });
    }
    throw ApiError.unauthorized('Invalid credentials');
  }

  user.loginAttempts = 0;
  user.lockUntil = null;
  user.lastLogin = new Date();
  await user.save();

  const payload = await buildUserPayload(user);
  await createAudit({ req: { ...req, user }, action: 'LOGIN_SUCCESS' });

  return { user: payload, accessToken: signAccess(user), refreshToken: signRefresh(user) };
};

export const refresh = async (refreshToken) => {
  if (!refreshToken) throw ApiError.unauthorized('No refresh token');
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, env.JWT.REFRESH_SECRET);
  } catch {
    throw ApiError.unauthorized('Invalid refresh token');
  }
  const user = await User.findById(decoded.sub);
  if (!user || user.status !== 'ACTIVE') throw ApiError.unauthorized();
  return { accessToken: signAccess(user) };
};

export const changePassword = async (req, userId, { oldPassword, newPassword }) => {
  const user = await User.findById(userId).select('+password');
  if (!user) throw ApiError.notFound('User not found');
  const valid = await user.comparePassword(oldPassword);
  if (!valid) throw ApiError.badRequest('Old password incorrect');
  user.password = newPassword;
  user.mustChangePassword = false;
  await user.save();
  await createAudit({ req, action: 'PASSWORD_CHANGED' });
  return true;
};

export const getProfile = async (user) => {
  return await buildUserPayload(user);
};

export const updateProfile = async (req, userId, data) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');

  if (data.profilePhoto !== undefined) {
    user.profilePhoto = data.profilePhoto;
  }

  const updatable = ['email', 'mobile'];
  updatable.forEach((k) => {
    if (data[k] !== undefined) user[k] = data[k];
  });

  await user.save();

  if (user.role === 'EMPLOYEE') {
    try {
      const employeeId = user.employeeId ? user.employeeId : (await Employee.findOne({ userId: user._id }).select('_id'))?._id;

      if (employeeId) {
        const updateData = {};
        if (data.mobile !== undefined) updateData.mobile = data.mobile;
        if (data.profilePhoto !== undefined) updateData.profilePhoto = data.profilePhoto;

        await Employee.findByIdAndUpdate(employeeId, updateData);
      }
    } catch (e) {
      logger.warn('Employee sync failed:', e.message);
    }
  }

  await createAudit({ req, action: 'PROFILE_UPDATED', targetType: 'User', targetId: user._id });
  return await buildUserPayload(user);
};