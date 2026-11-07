import { Advice } from './advice.model.js';
import { CLF } from '../clfs/clf.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { createAudit } from '../../middlewares/audit.middleware.js';
import { getISTDateString } from '../../utils/security.js';
import { generateCentralPDF } from '../../services/advicePdfEngine.js'; 
import { generatePatrankPrefix } from '../../utils/generatePatrank.js';

export const createAdvice = async (req, data) => {
  const user = req.user;
  const clfId = user.role === 'CLF' ? user.clfId : data.clfId;
  if (!clfId) throw ApiError.badRequest('CLF is required');
  
  const clf = await CLF.findById(clfId);
  if (!clf) throw ApiError.notFound('CLF not found');

  if (!data.employees || !data.employees.length) {
    throw ApiError.badRequest('At least one employee required');
  }
  if (!data.clfBankDetails || !data.clfBankDetails.accountNumber) {
    throw ApiError.badRequest('CLF Bank Account details are required');
  }

  const cleaned = data.employees.map((e, i) => {
    if (!e.name || !e.name.trim()) throw ApiError.badRequest(`Row ${i + 1}: name is required`);
    const amt = Number(e.amount);
    if (!amt || amt <= 0) throw ApiError.badRequest(`Row ${i + 1}: amount must be greater than 0`);
    return {
      sl: i + 1,
      name: String(e.name).trim(),
      designation: e.designation ? String(e.designation).trim() : '',
      month: e.month ? String(e.month).trim() : '',
      bankAccountNumber: e.bankAccountNumber ? String(e.bankAccountNumber).trim() : '',
      bankName: e.bankName ? String(e.bankName).trim() : '',
      branch: e.branch ? String(e.branch).trim() : '',
      ifscCode: e.ifscCode ? String(e.ifscCode).trim().toUpperCase() : '',
      amount: amt,
    };
  });

  const totalAmount = cleaned.reduce((s, e) => s + e.amount, 0);
  let inputAdviceNumber = data.adviceNumber ? String(data.adviceNumber).trim() : '';
  const currentYear = new Date().getFullYear();

  // ✅ 1. Auto prefix agar input khali hai
  if (!inputAdviceNumber) {
    const prefix = generatePatrankPrefix(clf.name);
    inputAdviceNumber = `${prefix}/CLF/${currentYear}/`;
  }

  // ✅ 2. Database ke liye unique banao, par PDF me clean bhejo
  let dbAdviceNumber = inputAdviceNumber;
  const existing = await Advice.findOne({ clfId: clf._id, adviceNumber: dbAdviceNumber, isDeleted: false });
  if (existing) {
    dbAdviceNumber = `${dbAdviceNumber}-${Date.now()}`; // Sirf DB ke liye
  }

  const advice = await Advice.create({
    adviceType: data.adviceType === 'EXPENSE' ? 'EXPENSE' : 'SALARY',
    adviceNumber: dbAdviceNumber, // DB me unique jayega
    adviceDate: data.adviceDate || getISTDateString(),
    clfBankDetails: data.clfBankDetails,
    createdByRole: user.role,
    createdByUser: user._id,
    createdByName: user.name || '',
    clfId: clf._id,
    blockId: clf.blockId,
    bankName: data.clfBankDetails.bankName || '',
    branch: data.clfBankDetails.branch || '',
    employees: cleaned,
    totalAmount,
    totalRows: cleaned.length,
  });

  // ✅ 3. PDF me exact clean number bhejo (timestamp NAHI)
  advice.adviceNumber = inputAdviceNumber;

  await createAudit({ req, action: 'ADVICE_CREATED', targetType: 'Advice', targetId: advice._id, metadata: { adviceNumber: inputAdviceNumber || '(empty)', totalAmount, rows: cleaned.length, adviceType: advice.adviceType } });
  return advice;
};

// ... (baaki functions same rahenge)








/* ────────────────────────────────────────────
   LIST ADVICES
   ──────────────────────────────────────────── */
export const listAdvices = async (req, query) => {
  try {
    const user = req.user;
    const filter = { isDeleted: false };
    
    if (user.role === 'CLF') {
      if (!user.clfId) throw ApiError.badRequest('CLF ID not found in token');
      filter.clfId = user.clfId;
    } else if (user.role === 'BPM') {
      if (!user.blockId) throw ApiError.badRequest('Block ID not found in token');
      filter.blockId = user.blockId;
    } else if (user.role === 'SUPER_ADMIN' && query.clfId) {
      filter.clfId = query.clfId;
    }

    if (query.adviceType) filter.adviceType = query.adviceType;

    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, parseInt(query.limit) || 20);

    const [items, total] = await Promise.all([
      Advice.find(filter).select('adviceNumber adviceType adviceDate bankName totalRows totalAmount createdAt clfBankDetails').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Advice.countDocuments(filter),
    ]);

    return { advices: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  } catch (error) {
    console.error("❌ List Advices Error:", error);
    throw error;
  }
};

/* ────────────────────────────────────────────
   GET ONE
   ──────────────────────────────────────────── */
export const getAdvice = async (req, id) => {
  const advice = await Advice.findById(id);
  if (!advice || advice.isDeleted) throw ApiError.notFound('Advice not found');
  return advice;
};

/* ────────────────────────────────────────────
   DELETE
   ──────────────────────────────────────────── */
export const deleteAdvice = async (req, id) => {
  const advice = await Advice.findById(id);
  if (!advice || advice.isDeleted) throw ApiError.notFound('Advice not found');

  const user = req.user;
  if (user.role === 'CLF' && String(user.clfId) !== String(advice.clfId)) {
    throw ApiError.forbidden('Access denied');
  }
  if (user.role === 'BPM' && String(user.blockId) !== String(advice.blockId)) {
    throw ApiError.forbidden('Access denied');
  }
  if (!['CLF', 'BPM', 'SUPER_ADMIN'].includes(user.role)) {
    throw ApiError.forbidden('Not allowed to delete');
  }

  advice.isDeleted = true;
  advice.deletedAt = new Date();
  advice.deletedBy = user._id;
  await advice.save();

  await createAudit({ req, action: 'ADVICE_DELETED', targetType: 'Advice', targetId: advice._id, metadata: { adviceNumber: advice.adviceNumber || '(empty)' } });
  return { deleted: true, adviceNumber: advice.adviceNumber };
};

/* ────────────────────────────────────────────
   GET CLF MEMBERS
   ──────────────────────────────────────────── */
export const getClfMembersForAdvice = async (clfId) => {
  const clf = await CLF.findById(clfId);
  if (!clf) throw ApiError.notFound('CLF not found');
  const members = [];

  const addMember = (m, designation) => {
    if (!m?.name) return;
    members.push({
      _id: m._id || `core-${designation.toLowerCase()}-${clf._id}`,
      name: m.name,
      designation: designation,
      bankDetails: { bankName: m.bankDetails?.bankName || '', accountNumber: m.bankDetails?.accountNumber || '', branch: m.bankDetails?.branch || '', ifsc: m.bankDetails?.ifscCode || '' },
    });
  };

  addMember(clf.coreMembers?.president, 'President (अध्यक्ष)');
  addMember(clf.coreMembers?.secretary, 'Secretary (सचिव)');
  addMember(clf.coreMembers?.treasurer, 'Treasurer (कोषाध्यक्ष)');

  if (clf.bodMembers && clf.bodMembers.length > 0) {
    clf.bodMembers.forEach((m) => { if (m.status === 'ACTIVE') addMember(m, m.designation || 'BOD Member'); });
  }
  return members;
};

/* ────────────────────────────────────────────
   GENERATE ADVICE PDF (Using Central Engine)
   ──────────────────────────────────────────── */
export const generateAdvicePDF = async (req, id, res, { inline = false } = {}) => {
  const advice = await Advice.findById(id);
  if (!advice || advice.isDeleted) throw ApiError.notFound('Advice not found');
  
  const clf = await CLF.findById(advice.clfId);
  if (!clf) throw ApiError.notFound('CLF not found');

  // ✅ FIX: Database me agar timestamp (-179397...) laga hua hai, toh use hatao
  // Kyunki DB me humne unique rakhne ke liye timestamp lagaya tha.
  let cleanAdviceNumber = advice.adviceNumber || '';
  if (cleanAdviceNumber.includes('-179')) {
    cleanAdviceNumber = cleanAdviceNumber.split('-')[0]; // Timestamp hata do
  }

  // Ek temporary object banao PDF ke liye jisme clean number ho
  const pdfAdvice = {
    ...advice.toObject(),
    adviceNumber: cleanAdviceNumber
  };

  // ✅ Central Engine ko clean object bhejo
  await generateCentralPDF(res, { advice: pdfAdvice, clf });
};