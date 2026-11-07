import { CLF } from './clf.model.js';
import { User } from '../users/user.model.js';
import { Employee } from '../employees/employee.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { generatePassword } from '../../utils/security.js';
import { createAudit } from '../../middlewares/audit.middleware.js';
import mongoose from 'mongoose';

/** BPM creates CLF in own block only */
export const createCLF = async (req, data) => {
  const { user } = req;
  const blockId = user.role === 'SUPER_ADMIN' ? data.blockId : user.blockId;
  if (!blockId) throw ApiError.badRequest('Block is required');

  const exists = await CLF.findOne({ code: data.code.toUpperCase() });
  if (exists) throw ApiError.conflict('CLF code already exists');

  const session = await mongoose.startSession();
  let result;
  try {
    await session.withTransaction(async () => {
      const clf = await CLF.create(
        [
          {
            ...data,
            code: data.code.toUpperCase(),
            loginId: data.code.toLowerCase(),
            blockId,
            bpmId: user.role === 'BPM' ? user._id : data.bpmId,
            createdBy: user._id,
          },
        ],
        { session }
      );

      const tempPassword = generatePassword(10);
      const username = data.code.toLowerCase();

      const clfUser = await User.create(
        [
          {
            username,
            password: tempPassword,
            role: 'CLF',
            name: data.name,
            email: data.email,
            mobile: data.contact,
            blockId,
            clfId: clf[0]._id,
            bpmId: user.role === 'BPM' ? user._id : data.bpmId,
            createdBy: user._id,
            mustChangePassword: true,
          },
        ],
        { session }
      );

      result = { clf: clf[0], user: clfUser[0], tempPassword };
    });

    await createAudit({
      req,
      action: 'CLF_CREATED',
      targetType: 'CLF',
      targetId: result.clf._id,
      metadata: { code: data.code, blockId },
    });

    return {
      clf: result.clf,
      login: {
        username: result.user.username,
        tempPassword: result.tempPassword,
      },
    };
  } finally {
    await session.endSession();
  }
};

/** Scoped listing */
export const listCLFs = async (req, query) => {
  const { user } = req;
  const filter = {};

  if (user.role === 'BPM') filter.blockId = user.blockId;
  else if (user.role === 'CLF') filter._id = user.clfId;
  else if (query.blockId) filter.blockId = query.blockId;

  if (query.status) filter.status = query.status;

  return CLF.find(filter)
    .populate('blockId', 'name code')
    .sort({ createdAt: -1 });
};

/** Get by ID with scope check */
export const getCLF = async (req, id) => {
  const clf = await CLF.findById(id).populate('blockId', 'name code');
  if (!clf) throw ApiError.notFound('CLF not found');
  assertCLFAccess(req.user, clf);
  return clf;
};

/** Scope verification */
export const assertCLFAccess = (user, clf) => {
  if (user.role === 'SUPER_ADMIN') return;
  
  if (user.role === 'BPM') {
    if (String(user.blockId) !== String(clf.blockId?._id || clf.blockId)) {
      throw ApiError.forbidden('Access denied to this CLF');
    }
    return;
  }
  
  if (user.role === 'CLF') {
    if (String(user.clfId) !== String(clf._id)) {
      throw ApiError.forbidden('Access denied');
    }
    return;
  }

  // ✅ FIX: Employee ko allow karo kyunki unhe apni leave letter ke liye CLF data chahiye
  if (user.role === 'EMPLOYEE') {
    if (String(user.clfId) !== String(clf._id)) {
       throw ApiError.forbidden('Access denied');
    }
    return;
  }

  throw ApiError.forbidden('Access denied');
};

/** BPM dashboard stats for own block */
export const getBPMDashboard = async (req) => {
  const blockId = req.user.blockId;
  const today = new Date().toISOString().slice(0, 10);

  const [totalCLFs, totalEmployees, todayActionPlans] = await Promise.all([
    CLF.countDocuments({ blockId, status: 'ACTIVE' }),
    Employee.countDocuments({ blockId, status: 'ACTIVE' }),
    (await import('../actionPlans/actionPlan.model.js')).ActionPlan.countDocuments({
      blockId,
      date: today,
    }),
  ]);

  return { totalCLFs, totalEmployees, todayActionPlans, date: today };
};

/** ✅ CLF apne BOD members, Core members, Bank Accounts, Letterhead & Footer update kare */
export const updateBodDetails = async (req, id, data) => {
  const clf = await CLF.findById(id);
  if (!clf) throw ApiError.notFound('CLF not found');

  if (req.user.role === 'CLF' && String(req.user.clfId) !== String(clf._id)) {
    throw ApiError.forbidden('Access denied');
  }
  if (!['CLF', 'SUPER_ADMIN'].includes(req.user.role)) {
    throw ApiError.forbidden('Only CLF or Super Admin can update details');
  }

  // ✅ FIX: Agar Name change ho raha hai, toh User model me bhi update karo
  if (data.name !== undefined && data.name !== clf.name) {
    clf.name = data.name;
    
    // User collection me bhi name sync karo (Taki Profile header me naya naam dikhe)
    await User.updateMany(
      { clfId: clf._id },
      { $set: { name: data.name } }
    );
  }

  // ✅ Letterhead, Footer, Signatures update
  if (data.letterhead !== undefined) clf.letterhead = data.letterhead;
  if (data.footer !== undefined) clf.footer = data.footer;
  if (data.signatures !== undefined) clf.signatures = data.signatures;

  let existingCore = clf.coreMembers || {};
  
  if (!existingCore.president && clf.president) {
    existingCore.president = { name: clf.president, mobile: '', address: '', bankDetails: {} };
  }
  if (!existingCore.secretary && clf.secretary) {
    existingCore.secretary = { name: clf.secretary, mobile: '', address: '', bankDetails: {} };
  }
  if (!existingCore.treasurer && clf.treasurer) {
    existingCore.treasurer = { name: clf.treasurer, mobile: '', address: '', bankDetails: {} };
  }

  if (data.coreMembers) {
    clf.coreMembers = {
      president: { ...existingCore.president, ...data.coreMembers.president },
      secretary: { ...existingCore.secretary, ...data.coreMembers.secretary },
      treasurer: { ...existingCore.treasurer, ...data.coreMembers.treasurer },
    };
  }

  if (data.bodMembers !== undefined) {
    clf.bodMembers = data.bodMembers;
  }

  if (data.bankAccounts !== undefined) {
    clf.bankAccounts = data.bankAccounts;
  }

  await clf.save();

  await createAudit({
    req,
    action: 'CLF_BOD_UPDATED',
    targetType: 'CLF',
    targetId: clf._id,
  });

  return clf;
};


/** ✅ FINAL: Reset CLF user's Login ID AND Password */
export const resetCLFPassword = async (req, id, rawData) => {
  let data = rawData;
  if (rawData && rawData.newPassword && typeof rawData.newPassword === 'object') {
    data = rawData.newPassword;
  }

  const { username, password } = data;

  if (password && password.trim() !== '') {
    if (password.length < 8) {
      throw ApiError.badRequest('Password must be at least 8 characters');
    }
    if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
      throw ApiError.badRequest('Password must contain letters and numbers');
    }
  }

  const clf = await CLF.findById(id);
  if (!clf) throw ApiError.notFound('CLF not found');

  const user = req.user;
  if (user.role === 'BPM' && String(user.blockId) !== String(clf.blockId)) {
    throw ApiError.forbidden('Access denied');
  }
  if (!['BPM', 'SUPER_ADMIN'].includes(user.role)) {
    throw ApiError.forbidden('Only BPM or Super Admin can reset CLF password');
  }

  const clfUser = await User.findOne({ clfId: clf._id, role: 'CLF' });
  if (!clfUser) throw ApiError.notFound('CLF user account not found');

  if (username && username.trim() !== '') {
    const newUsername = username.trim().toLowerCase();
    if (newUsername !== clfUser.username) {
      const existing = await User.findOne({ username: newUsername });
      if (existing && String(existing._id) !== String(clfUser._id)) {
        throw ApiError.conflict('This Login ID is already taken by another user');
      }
      clfUser.username = newUsername;
      clf.loginId = newUsername; 
    }
  }

  if (password && password.trim() !== '') {
    clfUser.password = password;
    clfUser.mustChangePassword = true;
  }

  clfUser.loginAttempts = 0;
  clfUser.lockUntil = null;

  await clfUser.save();
  await clf.save();

  await createAudit({
    req,
    action: 'CLF_CREDENTIALS_UPDATED',
    targetType: 'CLF',
    targetId: clf._id,
  });

  return {
    username: clfUser.username,
    loginId: clf.loginId,
    resetBy: user.role,
  };
};