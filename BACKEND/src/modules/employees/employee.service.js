import mongoose from 'mongoose';
import { Employee } from './employee.model.js';
import { CLF } from '../clfs/clf.model.js';
import { User } from '../users/user.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { encrypt, decrypt, generatePassword } from '../../utils/security.js';
import { createAudit } from '../../middlewares/audit.middleware.js';

import { Attendance } from '../attendance/attendance.model.js';
import { WorkDone } from '../workDone/workDone.model.js';
import { Leave } from '../leaves/leave.model.js';
import { ActionPlan } from '../actionPlans/actionPlan.model.js';
import { MessageRecipient } from '../notifications/notification.model.js';
import { deleteImage } from '../../services/cloudinary.service.js';
import { logger } from '../../utils/logger.js';

export const createEmployee = async (req, data) => {
  const user = req.user;
  const clfId = user.role === 'CLF' ? user.clfId : data.clfId;
  if (!clfId) throw ApiError.badRequest('CLF is required');

  const clf = await CLF.findById(clfId);
  if (!clf) throw ApiError.notFound('CLF not found');

  if (user.role === 'CLF' && String(user.clfId) !== String(clf._id)) {
    throw ApiError.forbidden('Access denied');
  }
  if (user.role === 'BPM' && String(user.blockId) !== String(clf.blockId)) {
    throw ApiError.forbidden('Block mismatch');
  }

  const empCode = data.employeeCode?.toUpperCase();

  const exists = await Employee.findOne({ employeeCode: empCode, clfId: clf._id });
  if (exists) throw ApiError.conflict('Employee code already exists in this CLF');

  const session = await mongoose.startSession();
  let result;
  try {
    await session.withTransaction(async () => {
      const tempPassword = generatePassword(10);
      const username = empCode.toLowerCase();
      const uniqueUsername = `${clf.code.toLowerCase()}_${username}`;

      const empUser = await User.create(
        [{
          username: uniqueUsername,
          password: tempPassword,
          role: 'EMPLOYEE',
          name: data.name,
          mobile: data.mobile,
          blockId: clf.blockId,
          clfId: clf._id,
          createdBy: user._id,
          mustChangePassword: true,
          profilePhoto: data.profilePhoto || '',
        }],
        { session }
      );

      const employee = await Employee.create(
        [{
          employeeCode: empCode,
          name: data.name,
          mobile: data.mobile,
          designation: data.designation,
          joiningDate: data.joiningDate,
          aadhaarNumber: data.aadhaarNumber ? encrypt(data.aadhaarNumber) : undefined,
          bankDetails: {
            bankName: data.bankDetails?.bankName,
            accountNumber: data.bankDetails?.accountNumber ? encrypt(data.bankDetails.accountNumber) : undefined,
            branch: data.bankDetails?.branch,
            ifsc: data.bankDetails?.ifsc?.toUpperCase(),
          },
          workLocation: { panchayat: data.workLocation.panchayat },
          profilePhoto: data.profilePhoto,
          clfId: clf._id,
          blockId: clf.blockId,
          userId: empUser[0]._id,
          createdBy: user._id,
        }],
        { session }
      );

      await User.findByIdAndUpdate(empUser[0]._id, { employeeId: employee[0]._id }, { session });

      result = { employee: employee[0], login: { username: uniqueUsername, tempPassword } };
    });

    await createAudit({
      req,
      action: 'EMPLOYEE_CREATED',
      targetType: 'Employee',
      targetId: result.employee._id,
      metadata: { employeeCode: empCode, clfId },
    });

    return result;
  } finally {
    await session.endSession();
  }
};

export const formatEmployee = (emp, { revealSensitive = false } = {}) => {
  const obj = emp.toObject ? emp.toObject() : emp;

  let aadhaarOut = null;
  if (obj.aadhaarNumber) {
    aadhaarOut = revealSensitive ? (decrypt(obj.aadhaarNumber) || 'XXXX-XXXX-XXXX') : 'XXXX-XXXX-XXXX';
  }

  let accountOut = null;
  if (obj.bankDetails?.accountNumber) {
    accountOut = revealSensitive ? (decrypt(obj.bankDetails.accountNumber) || 'XXXXXXXX') : 'XXXXXXXX';
  }

  return {
    ...obj,
    aadhaarNumber: aadhaarOut,
    bankDetails: { ...obj.bankDetails, accountNumber: accountOut },
  };
};

export const listEmployees = async (req, query) => {
  const user = req.user;
  const filter = {};

  if (user.role === 'CLF') filter.clfId = user.clfId;
  else if (user.role === 'BPM') filter.blockId = user.blockId;
  else if (user.role === 'SUPER_ADMIN' && query.clfId) filter.clfId = query.clfId;

  if (query.status) filter.status = query.status;
  if (query.search) {
    filter.$or = [
      { name: new RegExp(query.search, 'i') },
      { employeeCode: new RegExp(query.search, 'i') },
      { mobile: new RegExp(query.search, 'i') },
    ];
  }

  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, parseInt(query.limit) || 20);

  const [employees, total] = await Promise.all([
    Employee.find(filter)
      .select('+aadhaarNumber +bankDetails.accountNumber')
      .populate('clfId', 'name code')
      .populate('userId', 'profilePhoto')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Employee.countDocuments(filter),
  ]);

  if (user.role === 'EMPLOYEE') {
    return {
      employees: employees.filter((e) => String(e.userId?._id) === String(user._id)),
      pagination: { page, limit, total: 1, pages: 1 },
    };
  }

  const revealSensitive = ['CLF', 'BPM', 'SUPER_ADMIN'].includes(user.role);

  return {
    employees: employees.map((e) => formatEmployee(e, { revealSensitive })),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

export const getEmployee = async (req, id) => {
  const emp = await Employee.findById(id)
    .select('+aadhaarNumber +bankDetails.accountNumber')
    .populate('clfId', 'name code blockId')
    .populate('userId', 'profilePhoto');

  if (!emp) throw ApiError.notFound('Employee not found');
  assertEmployeeAccess(req.user, emp);

  const revealSensitive = ['CLF', 'BPM', 'SUPER_ADMIN', 'EMPLOYEE'].includes(req.user.role);
  return formatEmployee(emp, { revealSensitive });
};

export const assertEmployeeAccess = (user, emp) => {
  if (user.role === 'SUPER_ADMIN') return;
  const empClfId = emp.clfId?._id ? String(emp.clfId._id) : String(emp.clfId);
  const empBlockId = emp.blockId?._id ? String(emp.blockId._id) : String(emp.blockId);

  if (user.role === 'BPM' && String(user.blockId) === empBlockId) return;
  if (user.role === 'CLF' && String(user.clfId) === empClfId) return;
  if (user.role === 'EMPLOYEE' && String(user.employeeId) === String(emp._id)) return;

  throw ApiError.forbidden('Access denied');
};

/* ✅ UPDATE EMPLOYEE: Sirf CLF Admin edit kar sakta hai */
export const updateEmployee = async (req, id, data) => {
  const emp = await Employee.findById(id).select('+aadhaarNumber +bankDetails.accountNumber');
  if (!emp) throw ApiError.notFound('Employee not found');

  if (req.user.role !== 'CLF' || String(req.user.clfId) !== String(emp.clfId)) {
    throw ApiError.forbidden('Access denied. Only CLF Admin can edit employee details.');
  }

  const updatable = ['name', 'mobile', 'designation', 'joiningDate', 'profilePhoto'];
  updatable.forEach((k) => { if (data[k] !== undefined) emp[k] = data[k]; });

  if (data.workLocation?.panchayat) emp.workLocation.panchayat = data.workLocation.panchayat;

  if (data.bankDetails) {
    if (data.bankDetails.bankName) emp.bankDetails.bankName = data.bankDetails.bankName;
    if (data.bankDetails.accountNumber) emp.bankDetails.accountNumber = encrypt(data.bankDetails.accountNumber);
    if (data.bankDetails.branch) emp.bankDetails.branch = data.bankDetails.branch;
    if (data.bankDetails.ifsc) emp.bankDetails.ifsc = data.bankDetails.ifsc.toUpperCase();
  }

  if (data.aadhaarNumber) emp.aadhaarNumber = encrypt(data.aadhaarNumber);

  await emp.save();

  await User.findByIdAndUpdate(emp.userId, {
    ...(data.name && { name: data.name }),
    ...(data.mobile && { mobile: data.mobile }),
  });

  await createAudit({ req, action: 'EMPLOYEE_UPDATED', targetType: 'Employee', targetId: emp._id });
  return formatEmployee(emp, { revealSensitive: true });
};

export const setEmployeeStatus = async (req, id, status) => {
  const emp = await Employee.findById(id);
  if (!emp) throw ApiError.notFound('Employee not found');

  if (req.user.role !== 'CLF' || String(req.user.clfId) !== String(emp.clfId)) {
    if (req.user.role !== 'SUPER_ADMIN') throw ApiError.forbidden();
  }

  emp.status = status;
  await emp.save();
  await User.findByIdAndUpdate(emp.userId, { status: status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE' });
  await createAudit({ req, action: `EMPLOYEE_${status}`, targetType: 'Employee', targetId: id });
  return emp;
};

export const resetEmployeePassword = async (req, id, data) => {
  const { username, password } = data;

  const emp = await Employee.findById(id);
  if (!emp) throw ApiError.notFound('Employee not found');

  const user = req.user;
  if (user.role === 'CLF' && String(user.clfId) !== String(emp.clfId)) {
    throw ApiError.forbidden('Access denied');
  }
  if (user.role === 'BPM' && String(user.blockId) !== String(emp.blockId)) {
    throw ApiError.forbidden('Access denied');
  }
  if (!['CLF', 'SUPER_ADMIN'].includes(user.role)) {
    throw ApiError.forbidden('Only CLF or Super Admin can update credentials');
  }

  const empUser = await User.findById(emp.userId);
  if (!empUser) throw ApiError.notFound('Employee user account not found');

  if (username && username.trim() !== '') {
    const newCode = username.trim().toUpperCase();

    if (newCode !== emp.employeeCode) {
      const exists = await Employee.findOne({ employeeCode: newCode, clfId: emp.clfId, _id: { $ne: id } });
      if (exists) throw ApiError.conflict('Employee code already exists in this CLF');

      emp.employeeCode = newCode;
      await emp.save();

      empUser.username = newCode.toLowerCase();
    }
  }

  if (password && password.trim() !== '') {
    if (password.length < 8) throw ApiError.badRequest('Password must be at least 8 characters');
    if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password)) throw ApiError.badRequest('Password must contain letters and numbers');

    empUser.password = password;
    empUser.mustChangePassword = true;
    
  }

  empUser.loginAttempts = 0;
  empUser.lockUntil = null;
  await empUser.save();

  await createAudit({
    req,
    action: 'EMPLOYEE_CREDENTIALS_UPDATED',
    targetType: 'Employee',
    targetId: emp._id,
    metadata: { employeeCode: emp.employeeCode },
  });

  return { username: empUser.username, resetBy: user.role };
};

// ✅ NAYA: Employee Credentials Fetch karo
export const getEmployeeCredentials = async (req) => {
  if (req.user.role !== 'CLF') throw ApiError.forbidden('Only CLF Admin can view credentials');

  const employees = await Employee.find({ clfId: req.user.clfId })
    .populate('userId', 'username') 
    .select('name employeeCode userId designation')
    .sort({ name: 1 })
    .lean();

  return employees.map(emp => ({
    _id: emp._id,
    name: emp.name,
    employeeCode: emp.employeeCode,
    designation: emp.designation,
    username: emp.userId?.username || emp.employeeCode.toLowerCase(),
    password: '******',
  }));
};

// ✅ FIX #8: Soft delete + orphan cleanup
export const deleteEmployee = async (req, id) => {
  const emp = await Employee.findById(id);
  if (!emp) throw ApiError.notFound('Employee not found');

  const user = req.user;
  if (user.role === 'CLF' && String(user.clfId) !== String(emp.clfId)) {
    throw ApiError.forbidden('Access denied');
  }
  if (user.role === 'BPM' && String(user.blockId) !== String(emp.blockId)) {
    throw ApiError.forbidden('Access denied');
  }
  if (!['CLF', 'SUPER_ADMIN'].includes(user.role)) {
    throw ApiError.forbidden('Only CLF or Super Admin can delete employee');
  }

  try {
    await Promise.all([
      Attendance.deleteMany({ employeeId: emp._id }),
      WorkDone.deleteMany({ employeeId: emp._id }),
      Leave.deleteMany({ employeeId: emp._id }),
      ActionPlan.deleteMany({ employeeId: emp._id }),
      MessageRecipient.deleteMany({ employeeId: emp._id }),
    ]);

    if (emp.profilePhoto && emp.profilePhoto.includes('cloudinary')) {
      try {
        const publicId = emp.profilePhoto.split('/').slice(-2).join('/').replace(/\.[^.]+$/, '');
        await deleteImage(publicId);
      } catch (e) {
        logger.warn(`Profile photo delete failed: ${e.message}`);
      }
    }

    if (emp.userId) await User.findByIdAndDelete(emp.userId);
    await Employee.findByIdAndDelete(id);
  } catch (err) {
    logger.error(`Employee delete cascade failed: ${err.message}`);
    throw ApiError.internal('Employee delete failed');
  }

  await createAudit({
    req,
    action: 'EMPLOYEE_DELETED',
    targetType: 'Employee',
    targetId: emp._id,
    metadata: { employeeCode: emp.employeeCode, name: emp.name },
  });

  return { deleted: true, employeeCode: emp.employeeCode };
};