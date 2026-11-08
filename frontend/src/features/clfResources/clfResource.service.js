import { LokosCrp } from './lokosCrp.model.js';
import { VO } from './vo.model.js';
import { CLF } from '../clfs/clf.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { createAudit } from '../../middlewares/audit.middleware.js';

/* ═══════════════════════════════════════════
   SCOPE CHECK (Only CLF & BPM allowed)
   ═══════════════════════════════════════════ */
const assertClfScope = async (user, clfId) => {
  if (!clfId) {
    throw ApiError.badRequest('CLF ID is missing in request.');
  }

  const clf = await CLF.findById(clfId);
  if (!clf) throw ApiError.notFound('CLF not found in database');

  //  CLF Admin — sirf apna CLF access kar sakta hai
  if (user.role === 'CLF' && String(user.clfId) === String(clf._id)) return clf;

  //  BPM Admin — sirf apne block ke CLFs access kar sakta hai
  if (user.role === 'BPM' && String(user.blockId) === String(clf.blockId)) return clf;

  //  Baaki koi (Super Admin included) access nahi kar sakta
  throw ApiError.forbidden('Access denied. Only CLF or BPM can access this resource.');
};

/* ═══════════════════════════════════════════
   LOKOS CRP SERVICES
   ═══════════════════════════════════════════ */

export const createLokosCrp = async (req, data) => {
  //  FIX: Agar payload me clfId nahi, toh logged-in CLF user ka clfId use karo
  const clfId = data.clfId || req.user.clfId;
  const clf = await assertClfScope(req.user, clfId);

  //  Sirf CLF admin hi create kar sakta hai (BPM read-only)
  if (req.user.role !== 'CLF') {
    throw ApiError.forbidden('Only CLF Admin can create Lokos CRP');
  }

  const existing = await LokosCrp.findOne({
    clfId: clf._id,
    name: data.name.trim(),
    mobile: data.mobile.trim(),
  });
  if (existing) throw ApiError.conflict('Lokos CRP with same name & mobile already exists');

  const doc = await LokosCrp.create({
    clfId: clf._id,
    blockId: clf.blockId,
    name: data.name.trim(),
    village: data.village.trim(),
    designation: data.designation ? String(data.designation).trim().toUpperCase() : '',
    mobile: data.mobile.trim(),
    accountNumber: data.accountNumber ? String(data.accountNumber).trim() : '',
    bankName: data.bankName ? String(data.bankName).trim().toUpperCase() : '',
    branch: data.branch ? String(data.branch).trim().toUpperCase() : '',
    ifscCode: data.ifscCode ? String(data.ifscCode).trim().toUpperCase() : '',
    createdBy: req.user._id,
  });

  await createAudit({
    req,
    action: 'LOKOS_CRP_CREATED',
    targetType: 'LokosCrp',
    targetId: doc._id,
    metadata: { clfId: clf._id, name: doc.name },
  });

  return doc;
};

export const listLokosCrps = async (req, query) => {
  const user = req.user;
  const filter = {};

  //  CLF → apna data, BPM → block ka data
  if (user.role === 'CLF') {
    filter.clfId = user.clfId;
  } else if (user.role === 'BPM') {
    filter.blockId = user.blockId;
    //  BPM specific CLF filter kar sakta hai query se
    if (query.clfId) filter.clfId = query.clfId;
  } else {
    throw ApiError.forbidden('Access denied');
  }

  if (query.status) filter.status = query.status;
  if (query.search) {
    filter.$or = [
      { name: new RegExp(query.search, 'i') },
      { mobile: new RegExp(query.search, 'i') },
      { village: new RegExp(query.search, 'i') },
      { designation: new RegExp(query.search, 'i') },
    ];
  }

  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(200, parseInt(query.limit) || 50);

  const [items, total] = await Promise.all([
    LokosCrp.find(filter)
      .populate('clfId', 'name code')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    LokosCrp.countDocuments(filter),
  ]);

  return { lokosCrps: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
};

export const getLokosCrp = async (req, id) => {
  const doc = await LokosCrp.findById(id).populate('clfId', 'name code');
  if (!doc) throw ApiError.notFound('Lokos CRP not found');
  await assertClfScope(req.user, doc.clfId._id || doc.clfId);
  return doc;
};

export const updateLokosCrp = async (req, id, data) => {
  const doc = await LokosCrp.findById(id);
  if (!doc) throw ApiError.notFound('Lokos CRP not found');
  await assertClfScope(req.user, doc.clfId);

  //  Sirf CLF admin update kar sakta hai
  if (req.user.role !== 'CLF') {
    throw ApiError.forbidden('Only CLF Admin can update Lokos CRP');
  }

  const updatable = ['name', 'village', 'designation', 'mobile', 'accountNumber', 'bankName', 'branch', 'ifscCode', 'status'];
  updatable.forEach((k) => {
    if (data[k] !== undefined) {
      if (['designation', 'bankName', 'branch', 'ifscCode'].includes(k) && data[k]) {
        doc[k] = String(data[k]).trim().toUpperCase();
      } else {
        doc[k] = typeof data[k] === 'string' ? data[k].trim() : data[k];
      }
    }
  });

  await doc.save();

  await createAudit({
    req,
    action: 'LOKOS_CRP_UPDATED',
    targetType: 'LokosCrp',
    targetId: doc._id,
  });

  return doc;
};

export const deleteLokosCrp = async (req, id) => {
  const doc = await LokosCrp.findById(id);
  if (!doc) throw ApiError.notFound('Lokos CRP not found');
  await assertClfScope(req.user, doc.clfId);

  //  Sirf CLF admin delete kar sakta hai
  if (req.user.role !== 'CLF') {
    throw ApiError.forbidden('Only CLF Admin can delete Lokos CRP');
  }

  const meta = { name: doc.name, mobile: doc.mobile };
  await LokosCrp.findByIdAndDelete(id);

  await createAudit({
    req,
    action: 'LOKOS_CRP_DELETED',
    targetType: 'LokosCrp',
    targetId: id,
    metadata: meta,
  });

  return { deleted: true, name: meta.name };
};

/* ═══════════════════════════════════════════
   VO SERVICES
   ═══════════════════════════════════════════ */

const cleanMember = (m) => {
  if (!m) return {};
  return {
    name: m.name ? String(m.name).trim() : '',
    village: m.village ? String(m.village).trim() : '',
    phone: m.phone ? String(m.phone).trim() : '',
  };
};

export const createVo = async (req, data) => {
  const clfId = data.clfId || req.user.clfId;
  const clf = await assertClfScope(req.user, clfId);

  //  Sirf CLF admin create kar sakta hai
  if (req.user.role !== 'CLF') {
    throw ApiError.forbidden('Only CLF Admin can create VO');
  }

  const existing = await VO.findOne({ clfId: clf._id, voName: data.voName.trim() });
  if (existing) throw ApiError.conflict('VO with this name already exists in this CLF');

  const doc = await VO.create({
    clfId: clf._id,
    blockId: clf.blockId,
    voName: data.voName.trim(),
    accountNumber: data.accountNumber ? String(data.accountNumber).trim() : '',
    bankName: data.bankName ? String(data.bankName).trim().toUpperCase() : '',
    branch: data.branch ? String(data.branch).trim().toUpperCase() : '',
    ifscCode: data.ifscCode ? String(data.ifscCode).trim().toUpperCase() : '',
    sachiv: cleanMember(data.sachiv),
    adhyaksh: cleanMember(data.adhyaksh),
    koshaAdhyaksh: cleanMember(data.koshaAdhyaksh),
    createdBy: req.user._id,
  });

  await createAudit({
    req,
    action: 'VO_CREATED',
    targetType: 'VO',
    targetId: doc._id,
    metadata: { clfId: clf._id, voName: doc.voName },
  });

  return doc;
};

export const listVos = async (req, query) => {
  const user = req.user;
  const filter = {};

  //  CLF → apna data, BPM → block ka data
  if (user.role === 'CLF') {
    filter.clfId = user.clfId;
  } else if (user.role === 'BPM') {
    filter.blockId = user.blockId;
    if (query.clfId) filter.clfId = query.clfId;
  } else {
    throw ApiError.forbidden('Access denied');
  }

  if (query.status) filter.status = query.status;
  if (query.search) filter.voName = new RegExp(query.search, 'i');

  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(200, parseInt(query.limit) || 50);

  const [items, total] = await Promise.all([
    VO.find(filter)
      .populate('clfId', 'name code')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    VO.countDocuments(filter),
  ]);

  return { vos: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
};

export const getVo = async (req, id) => {
  const doc = await VO.findById(id).populate('clfId', 'name code');
  if (!doc) throw ApiError.notFound('VO not found');
  await assertClfScope(req.user, doc.clfId._id || doc.clfId);
  return doc;
};

export const updateVo = async (req, id, data) => {
  const doc = await VO.findById(id);
  if (!doc) throw ApiError.notFound('VO not found');
  await assertClfScope(req.user, doc.clfId);

  //  Sirf CLF admin update kar sakta hai
  if (req.user.role !== 'CLF') {
    throw ApiError.forbidden('Only CLF Admin can update VO');
  }

  if (data.voName !== undefined) doc.voName = String(data.voName).trim();
  if (data.status !== undefined) doc.status = data.status;
  if (data.accountNumber !== undefined) doc.accountNumber = String(data.accountNumber).trim();
  if (data.bankName !== undefined) doc.bankName = String(data.bankName).trim().toUpperCase();
  if (data.branch !== undefined) doc.branch = String(data.branch).trim().toUpperCase();
  if (data.ifscCode !== undefined) doc.ifscCode = String(data.ifscCode).trim().toUpperCase();

  if (data.sachiv !== undefined) {
    doc.sachiv = { ...doc.sachiv.toObject?.(), ...cleanMember(data.sachiv) };
  }
  if (data.adhyaksh !== undefined) {
    doc.adhyaksh = { ...doc.adhyaksh.toObject?.(), ...cleanMember(data.adhyaksh) };
  }
  if (data.koshaAdhyaksh !== undefined) {
    doc.koshaAdhyaksh = { ...doc.koshaAdhyaksh.toObject?.(), ...cleanMember(data.koshaAdhyaksh) };
  }

  await doc.save();

  await createAudit({
    req,
    action: 'VO_UPDATED',
    targetType: 'VO',
    targetId: doc._id,
  });

  return doc;
};

export const deleteVo = async (req, id) => {
  const doc = await VO.findById(id);
  if (!doc) throw ApiError.notFound('VO not found');
  await assertClfScope(req.user, doc.clfId);

  //  Sirf CLF admin delete kar sakta hai
  if (req.user.role !== 'CLF') {
    throw ApiError.forbidden('Only CLF Admin can delete VO');
  }

  const meta = { voName: doc.voName };
  await VO.findByIdAndDelete(id);

  await createAudit({
    req,
    action: 'VO_DELETED',
    targetType: 'VO',
    targetId: id,
    metadata: meta,
  });

  return { deleted: true, voName: meta.voName };
};