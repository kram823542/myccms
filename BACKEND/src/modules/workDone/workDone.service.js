import mongoose from 'mongoose';
import { WorkDone } from './workDone.model.js';
import { Employee } from '../employees/employee.model.js';
import { Attendance } from '../attendance/attendance.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { isWithinTimeWindow, getISTDateString } from '../../utils/security.js';
import { uploadBuffer, deleteImage } from '../../services/cloudinary.service.js';
import { createAudit } from '../../middlewares/audit.middleware.js';
import { logger } from '../../utils/logger.js';

const WINDOW_START = 17; // 5 PM
const WINDOW_END = 22;   // 10 PM

export const submitWorkDone = async (req, { description }, fileBuffer) => {
  if (req.user.role !== 'EMPLOYEE') throw ApiError.forbidden();

  if (!isWithinTimeWindow(WINDOW_START, WINDOW_END)) {
    throw ApiError.forbidden('Work Done submission window closed (5-10 PM IST)');
  }

  // ✅ CHANGED: Description mandatory, image optional
  if (!description || !description.trim()) {
    throw ApiError.badRequest('Work description is required');
  }

  const employee = await Employee.findOne({ userId: req.user._id });
  if (!employee) throw ApiError.notFound('Employee not found');

  const date = getISTDateString();
  let doc = await WorkDone.findOne({ employeeId: employee._id, date });

  if (doc && doc.status === 'PENDING') {
    throw ApiError.conflict('Work Done already submitted and awaiting approval');
  }
  if (doc && doc.status === 'APPROVED') {
    throw ApiError.conflict('Work Done already approved for today');
  }

  // ✅ Upload new image only if provided
  let upload = null;
  if (fileBuffer) {
    upload = await uploadBuffer(fileBuffer, `clf-portal/workdone/${employee._id}`);
  }

  if (doc && doc.status === 'REJECTED') {
    // ✅ Delete old image from Cloudinary if exists
    if (doc.imagePublicId) {
      try {
        await deleteImage(doc.imagePublicId);
      } catch (e) {
        logger.warn(`Old image delete failed: ${e.message}`);
      }
    }

    doc.rejectionHistory.push({
      reason: doc.rejectionReason,
      rejectedBy: doc.rejectedBy,
      rejectedAt: doc.rejectedAt,
    });

    // ✅ Editable: text + image (image optional)
    doc.description = description;
    doc.imageUrl = upload ? upload.secure_url : null;
    doc.imagePublicId = upload ? upload.public_id : null;

    doc.submittedAt = new Date();
    doc.status = 'PENDING';
    doc.version += 1;
    doc.rejectionReason = undefined;
    doc.rejectedBy = undefined;
    doc.rejectedAt = undefined;

    await doc.save();
  } else {
    // Fresh submission — image optional
    doc = await WorkDone.create({
      employeeId: employee._id,
      clfId: employee.clfId,
      blockId: employee.blockId,
      date,
      description,
      imageUrl: upload ? upload.secure_url : null,
      imagePublicId: upload ? upload.public_id : null,
    });
  }

  await createAudit({
    req,
    action: 'WORK_DONE_SUBMITTED',
    targetType: 'WorkDone',
    targetId: doc._id,
    metadata: { hasImage: !!upload, version: doc.version },
  });

  return doc;
};

export const listWorkDone = async (req, query) => {
  const user = req.user;
  const filter = {};

  if (user.role === 'EMPLOYEE') {
    const emp = await Employee.findOne({ userId: user._id });
    if (!emp) return { workDone: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } };
    filter.employeeId = emp._id;
  } else if (user.role === 'CLF') {
    filter.clfId = user.clfId;
  } else if (user.role === 'BPM') {
    filter.blockId = user.blockId;
  }
  if (query.status) filter.status = query.status;
  if (query.date) filter.date = query.date;
  if (query.employeeId) filter.employeeId = query.employeeId;

  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, parseInt(query.limit) || 50);

  const [items, total] = await Promise.all([
    WorkDone.find(filter)
      .populate('employeeId', 'name employeeCode designation workLocation')
      .populate('clfId', 'name code')
      .sort({ date: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    WorkDone.countDocuments(filter),
  ]);

  return { workDone: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
};

export const approveWorkDone = async (req, id) => {
  if (req.user.role !== 'CLF') throw ApiError.forbidden('Only CLF can approve');

  const doc = await WorkDone.findById(id);
  if (!doc) throw ApiError.notFound('Work Done not found');
  if (String(doc.clfId) !== String(req.user.clfId)) throw ApiError.forbidden('Access denied');
  if (doc.status !== 'PENDING') throw ApiError.conflict(`Cannot approve in status: ${doc.status}`);

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      doc.status = 'APPROVED';
      doc.approvedBy = req.user._id;
      doc.approvedAt = new Date();
      await doc.save({ session });

      // ✅ IMPORTANT: Attendance hamesha ORIGINAL doc.date pe mark hoga
      // (chahe approval kitne bhi din baad ho)
      await Attendance.findOneAndUpdate(
        { employeeId: doc.employeeId, date: doc.date },
        {
          $setOnInsert: {
            employeeId: doc.employeeId,
            clfId: doc.clfId,
            blockId: doc.blockId,
            date: doc.date,            // ✅ Original submission date
            status: 'PRESENT',
            source: 'WORK_DONE_APPROVAL',
            markedBy: req.user._id,
            workDoneId: doc._id,
          },
        },
        { upsert: true, session }
      );
    });

    await createAudit({
      req,
      action: 'WORK_DONE_APPROVED',
      targetType: 'WorkDone',
      targetId: doc._id,
      metadata: { attendanceDate: doc.date },
    });
    return doc;
  } finally {
    await session.endSession();
  }
};

export const rejectWorkDone = async (req, id, reason) => {
  if (req.user.role !== 'CLF') throw ApiError.forbidden('Only CLF can reject');

  const doc = await WorkDone.findById(id);
  if (!doc) throw ApiError.notFound('Work Done not found');
  if (String(doc.clfId) !== String(req.user.clfId)) throw ApiError.forbidden('Access denied');
  if (doc.status !== 'PENDING') throw ApiError.conflict('Can only reject pending');

  doc.status = 'REJECTED';
  doc.rejectedBy = req.user._id;
  doc.rejectedAt = new Date();
  doc.rejectionReason = reason;
  await doc.save();

  await createAudit({
    req,
    action: 'WORK_DONE_REJECTED',
    targetType: 'WorkDone',
    targetId: doc._id,
    metadata: { reason },
  });
  return doc;
};

export const pendingApprovals = async (req) => {
  if (req.user.role !== 'CLF') throw ApiError.forbidden();
  return WorkDone.find({ clfId: req.user.clfId, status: 'PENDING' })
    .populate('employeeId', 'name employeeCode designation workLocation')
    .populate('clfId', 'name code')
    .sort({ submittedAt: 1 });
};