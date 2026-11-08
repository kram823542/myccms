import mongoose from 'mongoose';
import { AuditLog } from '../modules/auditLogs/auditLog.model.js';
import { logger } from '../utils/logger.js';

export const createAudit = async ({
  req,
  action,
  targetType = null,
  targetId = null,
  metadata = null,
  status = 'SUCCESS',
}) => {
  try {
    if (!req) {
      logger.warn('Audit skipped: req object is undefined');
      return;
    }

    // ✅ FIX: Agar targetId valid ObjectId nahi hai (jaise 'singleton'), toh null kar do
    let safeTargetId = null;
    if (targetId && mongoose.Types.ObjectId.isValid(targetId)) {
      safeTargetId = targetId;
    }

    await AuditLog.create({
      userId: req.user?._id || null,
      userRole: req.user?.role || null,
      userName: req.user?.name || null,
      action,
      targetType,
      targetId: safeTargetId,
      metadata: { ...metadata, originalTargetId: targetId }, // Original ID metadata me save kar lo
      ipAddress: req.ip || req.headers?.['x-forwarded-for'] || 'Unknown',
      userAgent: req.headers?.['user-agent'] || 'Unknown Device',
      status,
    });
  } catch (err) {
    logger.error(`Audit log failed: ${err.message}`);
  }
};