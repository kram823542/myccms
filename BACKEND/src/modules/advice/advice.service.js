import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { Advice } from './advice.model.js';
import { CLF } from '../clfs/clf.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { createAudit } from '../../middlewares/audit.middleware.js';
import { getISTDateString } from '../../utils/security.js';
import { logger } from '../../utils/logger.js';

/* ────────────────────────────────────────────
   Fonts — Auto Detect Path
   ──────────────────────────────────────────── */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getFontPath = (fontName) => {
  const possiblePaths = [
    path.join(process.cwd(), 'assets', 'fonts', fontName),
    path.join(process.cwd(), 'src', 'assets', 'fonts', fontName),
    path.join(__dirname, '..', '..', '..', 'assets', 'fonts', fontName),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
};

const BUNDLED_FONT_REGULAR = getFontPath('NotoSansDevanagari-Regular.ttf');
const BUNDLED_FONT_BOLD = getFontPath('NotoSansDevanagari-Bold.ttf');

const SYSTEM_FONTS = {
  regular: [
    BUNDLED_FONT_REGULAR,
    'C:\\Windows\\Fonts\\Nirmala.ttf',
    'C:\\Windows\\Fonts\\mangal.ttf',
    'C:\\Windows\\Fonts\\arialuni.ttf',
    '/System/Library/Fonts/Supplemental/Devanagari Sangam MN.ttc',
    '/Library/Fonts/Arial Unicode.ttf',
    '/usr/share/fonts/truetype/noto/NotoSansDevanagari-Regular.ttf',
  ].filter(Boolean),
  bold: [
    BUNDLED_FONT_BOLD,
    'C:\\Windows\\Fonts\\NirmalaB.ttf',
    'C:\\Windows\\Fonts\\mangalb.ttf',
    'C:\\Windows\\Fonts\\arialunib.ttf',
    '/System/Library/Fonts/Supplemental/Devanagari Sangam MN Bold.ttc',
    '/Library/Fonts/Arial Unicode Bold.ttf',
    '/usr/share/fonts/truetype/noto/NotoSansDevanagari-Bold.ttf',
  ].filter(Boolean),
};

const findFont = (candidates) => {
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) return p;
    } catch { /* ignore */ }
  }
  return null;
};

const registerFonts = (doc) => {
  const regular = findFont(SYSTEM_FONTS.regular);
  const bold = findFont(SYSTEM_FONTS.bold);

  if (regular) {
    try { doc.registerFont('Devanagari', regular); }
    catch { doc.registerFont('Devanagari', 'Helvetica'); }
  } else {
    doc.registerFont('Devanagari', 'Helvetica');
  }

  if (bold) {
    try { doc.registerFont('Devanagari-Bold', bold); }
    catch { doc.registerFont('Devanagari-Bold', 'Helvetica-Bold'); }
  } else {
    doc.registerFont('Devanagari-Bold', regular || 'Helvetica-Bold');
  }
};

/* ────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────── */
const formatAmountInWords = (num) => {
  if (!num || num === 0) return 'Zero Rupees Only';
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

  const numToWords = (n) => {
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + numToWords(n % 100) : '');
    if (n < 100000) return numToWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + numToWords(n % 1000) : '');
    if (n < 10000000) return numToWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + numToWords(n % 100000) : '');
    return numToWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + numToWords(n % 10000000) : '');
  };

  return numToWords(Math.floor(num)) + ' Rupees Only';
};

const getBankShortName = (fullName) => {
  if (!fullName) return '';
  const map = {
    'state bank of india': 'SBI',
    'punjab national bank': 'PNB',
    'bank of india': 'BOI',
    'bank of baroda': 'BOB',
    'canara bank': 'Canara',
    'union bank of india': 'UBI',
    'indian bank': 'Indian Bank',
    'hdfc bank': 'HDFC',
    'icici bank': 'ICICI',
    'axis bank': 'Axis',
    'jharkhand rajya gramin bank': 'JRGB',
    'jharkhand gramin bank': 'JGB',
  };
  const key = fullName.toLowerCase().trim();
  return map[key] || fullName;
};

const fetchImageBuffer = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (err) {
    logger.warn(`⚠️ Logo fetch failed (${url}): ${err.message}`);
    return null;
  }
};

const assertScope = async (user, clfId) => {
  const clf = await CLF.findById(clfId);
  if (!clf) throw ApiError.notFound('CLF not found');

  if (user.role === 'SUPER_ADMIN') return clf;
  if (user.role === 'BPM' && String(user.blockId) === String(clf.blockId)) return clf;
  if (user.role === 'CLF' && String(user.clfId) === String(clf._id)) return clf;
  throw ApiError.forbidden('Access denied');
};

/* ────────────────────────────────────────────
   ✅ CREATE — adviceNumber OPTIONAL + CLF Bank Details
   ──────────────────────────────────────────── */
export const createAdvice = async (req, data) => {
  const user = req.user;
  const clfId = user.role === 'CLF' ? user.clfId : data.clfId;
  if (!clfId) throw ApiError.badRequest('CLF is required');

  const clf = await assertScope(user, clfId);

  if (!data.employees || !data.employees.length) {
    throw ApiError.badRequest('At least one employee required');
  }

  // ✅ NAYA: Bank Account validation
  if (!data.clfBankDetails || !data.clfBankDetails.accountNumber) {
    throw ApiError.badRequest('CLF Bank Account details are required');
  }

  const cleaned = data.employees.map((e, i) => {
    if (!e.name || !e.name.trim()) {
      throw ApiError.badRequest(`Row ${i + 1}: name is required`);
    }
    const amt = Number(e.amount);
    if (!amt || amt <= 0) {
      throw ApiError.badRequest(`Row ${i + 1}: amount must be greater than 0`);
    }
    return {
      sl: i + 1,
      name: String(e.name).trim(),
      designation: e.designation ? String(e.designation).trim() : '', // ✅ NEW
      month: e.month ? String(e.month).trim() : '',
      bankAccountNumber: e.bankAccountNumber ? String(e.bankAccountNumber).trim() : '',
      bankName: e.bankName ? String(e.bankName).trim() : '',
      branch: e.branch ? String(e.branch).trim() : '',
      ifscCode: e.ifscCode ? String(e.ifscCode).trim().toUpperCase() : '',
      amount: amt,
    };
  });

  const totalAmount = cleaned.reduce((s, e) => s + e.amount, 0);
  let adviceNumber = data.adviceNumber ? String(data.adviceNumber).trim() : '';
  const currentYear = new Date().getFullYear();
  const prefix = `SAT/CLF/${currentYear}/`;

  if (adviceNumber && !adviceNumber.startsWith('SAT/')) {
    let cleanNum = adviceNumber;
    if (cleanNum.includes('/')) {
      cleanNum = cleanNum.split('/').pop();
    }
    adviceNumber = prefix + cleanNum;
  }

  // ✅ FIXED: Sirf tab duplicate check karo jab adviceNumber daala gaya ho
  if (adviceNumber) {
    const existing = await Advice.findOne({
      clfId: clf._id,
      adviceNumber: adviceNumber, // Exact match
      isDeleted: false,
    });
    if (existing) {
      throw ApiError.conflict(`Advice number "${adviceNumber}" already exists for this CLF`);
    }
  }
  // Agar adviceNumber blank hai, toh ye check skip ho jayega, aur direct save hoga

  const advice = await Advice.create({
    adviceType: data.adviceType === 'EXPENSE' ? 'EXPENSE' : 'SALARY',
    adviceNumber,
    adviceDate: data.adviceDate || getISTDateString(),
    clfBankDetails: data.clfBankDetails, // ✅ Save selected bank details
    createdByRole: user.role,
    createdByUser: user._id,
    createdByName: user.name || '',
    clfId: clf._id,
    blockId: clf.blockId,
    bankName: data.clfBankDetails.bankName || '', // top-level backup
    branch: data.clfBankDetails.branch || '',
    employees: cleaned,
    totalAmount,
    totalRows: cleaned.length,
  });

  await createAudit({
    req,
    action: 'ADVICE_CREATED',
    targetType: 'Advice',
    targetId: advice._id,
    metadata: {
      adviceNumber: adviceNumber || '(empty)',
      totalAmount,
      rows: cleaned.length,
      adviceType: advice.adviceType,
    },
  });

  return advice;
};

/* ────────────────────────────────────────────
   LIST (Optimized Query)
   ──────────────────────────────────────────── */
export const listAdvices = async (req, query) => {
  const user = req.user;
  const filter = { isDeleted: false };

  if (user.role === 'CLF') filter.clfId = user.clfId;
  else if (user.role === 'BPM') filter.blockId = user.blockId;
  else if (user.role === 'SUPER_ADMIN' && query.clfId) filter.clfId = query.clfId;

  if (query.adviceType) filter.adviceType = query.adviceType;

  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, parseInt(query.limit) || 20);

  const [items, total] = await Promise.all([
    Advice.find(filter)
      .select('adviceNumber adviceType adviceDate bankName totalRows totalAmount createdAt clfBankDetails')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Advice.countDocuments(filter),
  ]);

  return {
    advices: items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

/* ────────────────────────────────────────────
   GET ONE
   ──────────────────────────────────────────── */
export const getAdvice = async (req, id) => {
  const advice = await Advice.findById(id);
  if (!advice || advice.isDeleted) throw ApiError.notFound('Advice not found');
  await assertScope(req.user, advice.clfId);
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

  await createAudit({
    req,
    action: 'ADVICE_DELETED',
    targetType: 'Advice',
    targetId: advice._id,
    metadata: { adviceNumber: advice.adviceNumber || '(empty)' },
  });

  return { deleted: true, adviceNumber: advice.adviceNumber };
};

/* ────────────────────────────────────────────
   ✅ CLF Members for Advice
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
      bankDetails: {
        bankName: m.bankDetails?.bankName || '',
        accountNumber: m.bankDetails?.accountNumber || '',
        branch: m.bankDetails?.branch || '',
        ifsc: m.bankDetails?.ifscCode || '',
      },
    });
  };

  addMember(clf.coreMembers?.president, 'President (अध्यक्ष)');
  addMember(clf.coreMembers?.secretary, 'Secretary (सचिव)');
  addMember(clf.coreMembers?.treasurer, 'Treasurer (कोषाध्यक्ष)');

  if (clf.bodMembers && clf.bodMembers.length > 0) {
    clf.bodMembers.forEach((m) => {
      if (m.status === 'ACTIVE') addMember(m, m.designation || 'BOD Member');
    });
  }

  return members;
};

/* ────────────────────────────────────────────
   ✅ PDF GENERATE — Exact Image Format
   ──────────────────────────────────────────── */
export const generateAdvicePDF = async (req, id, res, { inline = false } = {}) => {
  const advice = await Advice.findById(id);
  if (!advice || advice.isDeleted) throw ApiError.notFound('Advice not found');
  await assertScope(req.user, advice.clfId);

  const LEFT_LOGO_URL =
    'https://res.cloudinary.com/dsjnikk42/image/upload/v1789380290/WhatsApp_Image_2026-09-14_at_1.07.08_PM_nbbmda.jpg';
  const RIGHT_LOGO_URL =
    'https://res.cloudinary.com/dsjnikk42/image/upload/v1789380471/WhatsApp_Image_2026-09-14_at_1.07.10_PM_owpahi.jpg';

  const [leftLogoBuf, rightLogoBuf] = await Promise.all([
    fetchImageBuffer(LEFT_LOGO_URL),
    fetchImageBuffer(RIGHT_LOGO_URL),
  ]);

  const doc = new PDFDocument({
    size: 'A4',
    margin: 0,
    bufferPages: true,
    autoFirstPage: false,
  });
  registerFonts(doc);

  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const marginLeft = 30;
  const marginRight = 30;
  const contentWidth = pageWidth - marginLeft - marginRight;

  const employees = advice.employees;
  const totalAmount = advice.totalAmount;

  // ✅ NAYA: Selected Bank Data
  const clfBank = advice.clfBankDetails || {
    bankName: advice.bankName || '-',
    accountNumber: '-',
    branch: advice.branch || '-'
  };

  const PAGE_1_MAX = 5;
  const PAGE_NEXT_MAX = 11;
  const SIGNATURE_FITS_THRESHOLD = 4;

  const chunks = [];
  if (employees.length <= PAGE_1_MAX) {
    chunks.push(employees);
  } else {
    chunks.push(employees.slice(0, PAGE_1_MAX));
    let rem = employees.slice(PAGE_1_MAX);
    while (rem.length > 0) {
      chunks.push(rem.slice(0, PAGE_NEXT_MAX));
      rem = rem.slice(PAGE_NEXT_MAX);
    }
  }
  const lastChunk = chunks[chunks.length - 1];
  if (lastChunk.length > SIGNATURE_FITS_THRESHOLD) chunks.push([]);

  const drawStrip = (y) => {
    const h = 8;
    const w1 = contentWidth * 0.3;
    const w2 = contentWidth * 0.7;
    doc.rect(marginLeft, y, w1, h).fill('#82c828');
    doc.rect(marginLeft + w1, y, w2, h).fill('#e05a10');
    doc.fillColor('black');
  };

  chunks.forEach((chunk, pageIndex) => {
    doc.addPage({ size: 'A4', margin: 0 });

    const isLastPage = pageIndex === chunks.length - 1;
    const isSignatureOnlyPage = isLastPage && chunk.length === 0;

    let y = 30;

    drawStrip(y);
    y += 18;

    const logoSize = 70;
    const logoY = y;
    const titleWidth = pageWidth - marginLeft - marginRight - logoSize * 2 - 20;
    const titleX = marginLeft + logoSize + 10;

    if (leftLogoBuf) {
      try { doc.image(leftLogoBuf, marginLeft, logoY, { fit: [logoSize, logoSize] }); } catch (e) {}
    }

    if (rightLogoBuf) {
      try { doc.image(rightLogoBuf, pageWidth - marginRight - logoSize, logoY, { fit: [logoSize, logoSize] }); } catch (e) {}
    }

    let ty = logoY + 10;
    doc.font('Devanagari-Bold').fontSize(18).fillColor('black');
    doc.text('सतबरवा आजीविका महिला संकुल स्तरीय', titleX, ty, { width: titleWidth, align: 'center' });
    ty += 22;

    doc.font('Devanagari-Bold').fontSize(13);
    doc.text('प्राथमिक स्वावलम्बी सहकारी समिति लिमिटेड', titleX, ty, { width: titleWidth, align: 'center' });
    ty += 18;

    doc.font('Devanagari').fontSize(8.5);
    doc.text('ग्राम- सतबरवा, कलस्टर- सतबरवा, प्रखंड- सतबरवा, जिला- पलामू (झा0)', titleX, ty, { width: titleWidth, align: 'center' });
    ty += 11;

    doc.text('निबंधन संख्या :- 02-JKD-01-04-01-0TH-001-2023', titleX, ty, { width: titleWidth, align: 'center' });

    y = Math.max(logoY + logoSize, ty + 10) + 6;
    drawStrip(y);
    y += 18;

    doc.font('Devanagari').fontSize(10).fillColor('black');
    const dateStr = new Date(advice.adviceDate).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    // ✅ CHANGED: Blank space agar number nahi hai
    const adviceNumberText = advice.adviceNumber && advice.adviceNumber.trim() ? advice.adviceNumber : '';
    doc.text(`पत्रांक_  ${adviceNumberText}`, marginLeft, y);
    doc.text(`दिनांक - ${dateStr}`, marginLeft, y, { width: contentWidth, align: 'right' });
    y += 18;

    if (pageIndex === 0) {
      // ✅ DYNAMIC BANK NAME
      doc.font('Devanagari-Bold').fontSize(10).text('To', marginLeft, y);
      y += 12;
      doc.font('Devanagari').fontSize(10).text('The Branch Manager', marginLeft, y);
      y += 12;
      doc.text(clfBank.bankName, marginLeft, y);
      y += 12;
      if (clfBank.branch) {
        doc.text(`Branch: ${clfBank.branch}`, marginLeft, y);
        y += 12;
      }
      y += 4;
      
      doc.font('Devanagari-Bold').fontSize(11).text('Subject: Bank Advice for transfer', marginLeft, y, { underline: true });
      y += 18;
      
      doc.font('Devanagari').fontSize(10);
      
      // ✅ DYNAMIC REF ACCOUNT NUMBER
      doc.text(
        `Ref: SB Account number : Satbarwa Aajeevika Mahila Sankul Astariva Prathmik Swalambi Sahkari Samitil , SB A/c No. ${clfBank.accountNumber}`,
        marginLeft, y, { width: contentWidth }
      );
      y += 24;
      
      doc.text('Dear Sir,', marginLeft, y);
      y += 14;
      
      // ✅ EXACT IMAGE FORMAT (No Ch. No.)
      doc.text(
        `Please debit a sum of Rs. ${totalAmount.toLocaleString('en-IN')}/- (${formatAmountInWords(totalAmount)})`,
        marginLeft, y, { width: contentWidth, align: 'justify' }
      );
      y = doc.y + 6;
      
      // ✅ FIXED: Cheque Number ki jagah (Pen se likhne ke liye)
      doc.text(
        `From our saving bank account of Satbarwa Aajeevika Mahila Sankul Sangh , SB A/c No. ${clfBank.accountNumber}, vide Ch. No. ________________ by the fastest mode of remittance as per the details given below:`,
        marginLeft, y, { width: contentWidth, align: 'justify' }
      );
      y = doc.y + 12;
    } else {
      doc.font('Devanagari').fontSize(10);
      doc.text(`(Page ${pageIndex + 1} of ${chunks.length})`, 0, y, { width: pageWidth, align: 'center' });
      y += 18;
    }

      if (!isSignatureOnlyPage) {
      // ✅ UPDATED: Name & Designation ki width badhayi aur baaki adjust kiye
      const colWidths = { sl: 20, name: 85, designation: 50, month: 55, bankAccountNumber: 85, bank: 45, branch: 50, ifsc: 65, amount: 65 };
      const totalTableWidth = Object.values(colWidths).reduce((a, b) => a + b, 0);

      const startX = marginLeft + (contentWidth - totalTableWidth) / 2;
      const rowHeight = 20;

      let x = startX;
      const headers = [
        { w: colWidths.sl, label: 'Sl.' },
        { w: colWidths.name, label: 'Name' },
        { w: colWidths.designation, label: 'Desig' }, 
        { w: colWidths.month, label: 'Month' },
        { w: colWidths.bankAccountNumber, label: 'Bank A/c' },
        { w: colWidths.bank, label: 'Bank' },
        { w: colWidths.branch, label: 'Branch' },
        { w: colWidths.ifsc, label: 'IFSC' },
        { w: colWidths.amount, label: 'Amount' },
      ];

      doc.rect(startX, y, totalTableWidth, rowHeight).fill('#F3F4F6');
      doc.fillColor('black');
      doc.font('Devanagari-Bold').fontSize(8);

      headers.forEach((h) => {
        doc.rect(x, y, h.w, rowHeight).stroke();
        doc.text(h.label, x + 2, y + 6, { width: h.w - 4, align: h.label === 'Amount' ? 'right' : 'left' });
        x += h.w;
      });
      y += rowHeight;

      doc.font('Devanagari').fontSize(8);
      chunk.forEach((emp) => {
        x = startX;
        
        // ✅ FIX: Dynamic Row Height calculate karo taaki text 2 line me fit ho jaye
        const nameText = String(emp.name || '-');
        const desigText = String(emp.designation || '-');
        const nameHeight = doc.heightOfString(nameText, { width: colWidths.name - 4 });
        const desigHeight = doc.heightOfString(desigText, { width: colWidths.designation - 4 });
        
        const currentRowHeight = Math.max(rowHeight, nameHeight + 6, desigHeight + 6);

        const rowValues = [
          { w: colWidths.sl, value: `${emp.sl}.`, align: 'center', wrap: false },
          { w: colWidths.name, value: nameText, align: 'left', wrap: true }, // ✅ wrap true
          { w: colWidths.designation, value: desigText, align: 'left', wrap: true }, // ✅ wrap true
          { w: colWidths.month, value: emp.month || '-', align: 'left', wrap: false },
          { w: colWidths.bankAccountNumber, value: emp.bankAccountNumber || '-', align: 'left', wrap: false },
          { w: colWidths.bank, value: getBankShortName(emp.bankName), align: 'left', wrap: false },
          { w: colWidths.branch, value: emp.branch || '-', align: 'left', wrap: false },
          { w: colWidths.ifsc, value: emp.ifscCode || '-', align: 'left', wrap: false },
          { w: colWidths.amount, value: emp.amount.toLocaleString('en-IN'), align: 'right', wrap: false },
        ];
        
        rowValues.forEach((v) => {
          doc.rect(x, y, v.w, currentRowHeight).stroke();
          const textY = y + (v.wrap ? 5 : (currentRowHeight - 8) / 2 + 2);
          
          doc.text(v.value, x + 2, textY, { 
            width: v.w - 4, 
            align: v.align, 
            lineBreak: v.wrap ? true : false, 
            ellipsis: !v.wrap 
          });
          x += v.w;
        });
        y += currentRowHeight;
      });

      if (isLastPage && chunk.length > 0) {
        x = startX;
        const totalW = colWidths.sl + colWidths.name + colWidths.designation + colWidths.month + colWidths.bankAccountNumber + colWidths.bank + colWidths.branch + colWidths.ifsc;
        
        const totalRowValues = [
          { w: totalW, value: 'TOTAL', align: 'right', bold: true },
          { w: colWidths.amount, value: `${totalAmount.toLocaleString('en-IN')}.00`, align: 'right', bold: true },
        ];
        totalRowValues.forEach((v) => {
          doc.rect(x, y, v.w, rowHeight).fillAndStroke('#F9FAFB', 'black');
          doc.fillColor('black');
          doc.font(v.bold ? 'Devanagari-Bold' : 'Devanagari').fontSize(9);
          doc.text(v.value, x + 3, y + 6, { width: v.w - 6, align: v.align });
          x += v.w;
        });
        y += rowHeight + 10;

        doc.font('Devanagari').fontSize(10);
        doc.text(`Rs. ${totalAmount.toLocaleString('en-IN')}/- (${formatAmountInWords(totalAmount)})`, marginLeft, y, { width: contentWidth });
        y = doc.y + 10;
      } else { y += 6; }
    }













    if (isLastPage) {
      const footerTop = pageHeight - 90;
      const sigY = footerTop - 40;
      const sigWidth = 80;
      const gap = 20;
      const sigLabels = ['अध्यक्ष', 'सचिव', 'कोषाध्यक्ष'];

      doc.font('Devanagari-Bold').fontSize(10).fillColor('black');
      sigLabels.forEach((label, i) => {
        const sx = marginLeft + i * (sigWidth + gap);
        doc.moveTo(sx, sigY).lineTo(sx + sigWidth, sigY).stroke();
        doc.text(label, sx, sigY + 4, { width: sigWidth, align: 'center' });
      });

      doc.font('Devanagari-Bold').fontSize(9);
      const rightX = marginLeft + contentWidth - 180;
      doc.text('Thanking You.', rightX, sigY - 30, { width: 180, align: 'right' });
      doc.text('सतबरवा आजीविका महिला संकुल स्तरीय', rightX, sigY - 16, { width: 180, align: 'right' });
      doc.text('प्राथमिक स्वावलम्बी सहकारी समिति लिमिटेड', rightX, sigY - 4, { width: 180, align: 'right' });

      drawStrip(footerTop);
      let fy = footerTop + 12;
      doc.font('Devanagari').fontSize(7.5).fillColor('black');
      const footerLines = [
        'प्रखंड कार्यालय :- प्रखंड मिशन प्रबंधन इकाई, राँची रोड, सतबरवा पलामू 822126',
        'जिला कार्यालय :- जिला मिशन प्रबंधन इकाई, पुराना DRDA कार्यालय भवन , पलामू , 822102',
        'राज्य कार्यालय :- द्वितीय तल, झारखण्ड राज्य कृषि विपणन पर्षद, ईटकी रोड, हेहल,राँची – 834005 झारखण्ड',
        'फोन नं0 0651 2360038 / 2360142',
      ];
      footerLines.forEach((line) => {
        doc.text(line, 0, fy, { width: pageWidth, align: 'center' });
        fy += 10;
      });
    }
  });

  const safeNumber = (advice.adviceNumber && advice.adviceNumber.trim()) ? advice.adviceNumber.replace(/\//g, '-') : `ADV-${advice._id}`;
  const filename = `Advice-${safeNumber}.pdf`;
  const disposition = inline ? 'inline' : 'attachment';

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `${disposition}; filename="${filename}"`);

  doc.pipe(res);
  doc.end();
};