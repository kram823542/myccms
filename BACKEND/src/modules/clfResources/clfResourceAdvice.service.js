// import PDFDocument from 'pdfkit';
// import fs from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import { LokosCrp } from './lokosCrp.model.js';
// import { VO } from './vo.model.js';
// import { CLF } from '../clfs/clf.model.js';
// import { ApiError } from '../../utils/ApiError.js';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const getFontPath = (fontName) => {
//   const paths = [
//     path.join(process.cwd(), 'assets', 'fonts', fontName),
//     path.join(process.cwd(), 'src', 'assets', 'fonts', fontName),
//     path.join(__dirname, '..', '..', '..', 'assets', 'fonts', fontName),
//   ];
//   for (const p of paths) if (fs.existsSync(p)) return p;
//   return null;
// };

// const BUNDLED_FONT_REGULAR = getFontPath('NotoSansDevanagari-Regular.ttf');
// const BUNDLED_FONT_BOLD = getFontPath('NotoSansDevanagari-Bold.ttf');
// const SYSTEM_FONTS = {
//   regular: [BUNDLED_FONT_REGULAR, 'C:\\Windows\\Fonts\\Nirmala.ttf', '/usr/share/fonts/truetype/noto/NotoSansDevanagari-Regular.ttf'].filter(Boolean),
//   bold: [BUNDLED_FONT_BOLD, 'C:\\Windows\\Fonts\\NirmalaB.ttf', '/usr/share/fonts/truetype/noto/NotoSansDevanagari-Bold.ttf'].filter(Boolean),
// };

// const findFont = (candidates) => {
//   for (const p of candidates) { try { if (fs.existsSync(p)) return p; } catch {} }
//   return null;
// };

// const registerFonts = (doc) => {
//   const regular = findFont(SYSTEM_FONTS.regular);
//   const bold = findFont(SYSTEM_FONTS.bold);
//   doc.registerFont('Devanagari', regular || 'Helvetica');
//   doc.registerFont('Devanagari-Bold', bold || regular || 'Helvetica-Bold');
// };

// const formatAmountInWords = (num) => {
//   if (!num || num === 0) return 'Zero Rupees Only';
//   const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
//   const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
//   const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
//   const numToWords = (n) => {
//     if (n < 10) return ones[n];
//     if (n < 20) return teens[n - 10];
//     if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
//     if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + numToWords(n % 100) : '');
//     if (n < 100000) return numToWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + numToWords(n % 1000) : '');
//     if (n < 10000000) return numToWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + numToWords(n % 100000) : '');
//     return numToWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + numToWords(n % 10000000) : '');
//   };
//   return numToWords(Math.floor(num)) + ' Rupees Only';
// };

// const getBankShortName = (fullName) => {
//   if (!fullName) return '';
//   const map = { 'state bank of india': 'SBI', 'punjab national bank': 'PNB', 'bank of india': 'BOI', 'bank of baroda': 'BOB', 'canara bank': 'Canara', 'union bank of india': 'UBI', 'indian bank': 'Indian Bank', 'hdfc bank': 'HDFC', 'icici bank': 'ICICI', 'axis bank': 'Axis', 'jharkhand rajya gramin bank': 'JRGB', 'jharkhand gramin bank': 'JGB' };
//   return map[fullName.toLowerCase().trim()] || fullName;
// };

// export const generateResourceAdvicePDF = async (req, res, { type, ids, month, selectedBank, chequeNo }) => {
//   const clfId = req.user.clfId;
//   const clf = await CLF.findById(clfId);
//   if (!clf) throw ApiError.notFound('CLF not found');

//   let resources = [];
//   if (type === 'LOKOS') {
//     resources = await LokosCrp.find({ _id: { $in: ids }, clfId });
//   } else if (type === 'VO') {
//     resources = await VO.find({ _id: { $in: ids }, clfId });
//   } else {
//     throw ApiError.badRequest('Invalid type');
//   }

//   if (!resources.length) throw ApiError.badRequest('No resources found');

//   const doc = new PDFDocument({ size: 'A4', margin: 0, bufferPages: true, autoFirstPage: false });
//   registerFonts(doc);

//   const pageWidth = 595.28;
//   const marginLeft = 30;
//   const marginRight = 30;
//   const contentWidth = pageWidth - marginLeft - marginRight;

//   // ✅ HEADER (Employee Advice jaisa hi)
//   doc.addPage({ size: 'A4', margin: 0 });
//   let y = 30;
//   doc.rect(marginLeft, y, contentWidth * 0.3, 8).fill('#82c828');
//   doc.rect(marginLeft + contentWidth * 0.3, y, contentWidth * 0.7, 8).fill('#e05a10');
//   y += 18;

//   doc.font('Devanagari').fontSize(16).fillColor('black').text(clf.name, marginLeft, y, { width: contentWidth, align: 'center' });
//   y += 24;
//   doc.font('Devanagari').fontSize(10).text(clf.letterhead?.addressLine || '', marginLeft, y, { width: contentWidth, align: 'center' });
//   y += 20;

//   // Bank Info
//   doc.font('Devanagari-Bold').fontSize(10).text('To', marginLeft, y); y += 12;
//   doc.font('Devanagari').fontSize(10).text('The Branch Manager', marginLeft, y); y += 12;
//   doc.text(selectedBank.bankName, marginLeft, y); y += 12;
//   doc.text(`Branch: ${selectedBank.branch}`, marginLeft, y); y += 20;

//   doc.font('Devanagari-Bold').fontSize(11).text('Subject: Bank Advice for transfer', marginLeft, y, { underline: true }); y += 20;

//   // ✅ TABLE
//   const colWidths = { sl: 25, name: 120, bank: 80, account: 110, ifsc: 80, amount: 80 };
//   const totalTableWidth = Object.values(colWidths).reduce((a, b) => a + b, 0);
//   const startX = marginLeft + (contentWidth - totalTableWidth) / 2;
//   let x = startX;

//   const headers = [
//     { w: colWidths.sl, label: 'Sl.' }, { w: colWidths.name, label: 'Name' }, { w: colWidths.bank, label: 'Bank' },
//     { w: colWidths.account, label: 'A/c Number' }, { w: colWidths.ifsc, label: 'IFSC' }, { w: colWidths.amount, label: 'Amount' },
//   ];

//   doc.rect(startX, y, totalTableWidth, 20).fill('#F3F4F6');
//   doc.fillColor('black').font('Devanagari-Bold').fontSize(8);
//   headers.forEach(h => {
//     doc.rect(x, y, h.w, 20).stroke();
//     doc.text(h.label, x + 2, y + 6, { width: h.w - 4, align: 'center' });
//     x += h.w;
//   });
//   y += 20;

//   let totalAmount = 0;
//   doc.font('Devanagari').fontSize(8);

//   resources.forEach((r, idx) => {
//     let name = r.name || r.voName;
//     let accNo = r.accountNumber || '';
//     let bankName = r.bankName || '';
//     let ifsc = r.ifscCode || '';
//     let amount = r.amount || 1000; // Default amount, frontend se aana chahiye

//     if (r.voName) {
//       name = `${r.voName} (Sachiv: ${r.sachiv?.name || '-'})`;
//       accNo = r.sachiv?.bankDetails?.accountNumber || 'N/A';
//       bankName = r.sachiv?.bankDetails?.bankName || 'N/A';
//       ifsc = r.sachiv?.bankDetails?.ifscCode || 'N/A';
//     } else {
//       accNo = r.bankDetails?.accountNumber || 'N/A';
//       bankName = r.bankDetails?.bankName || 'N/A';
//       ifsc = r.bankDetails?.ifscCode || 'N/A';
//     }

//     totalAmount += amount;

//     x = startX;
//     const vals = [
//       { w: colWidths.sl, v: idx + 1, align: 'center' },
//       { w: colWidths.name, v: name, align: 'left' },
//       { w: colWidths.bank, v: getBankShortName(bankName), align: 'center' },
//       { w: colWidths.account, v: accNo, align: 'center' },
//       { w: colWidths.ifsc, v: ifsc, align: 'center' },
//       { w: colWidths.amount, v: amount.toLocaleString('en-IN'), align: 'right' },
//     ];

//     vals.forEach(v => {
//       doc.rect(x, y, v.w, 20).stroke();
//       doc.text(String(v.v), x + 2, y + 6, { width: v.w - 4, align: v.align });
//       x += v.w;
//     });
//     y += 20;
//   });

//   // Total
//   x = startX;
//   doc.rect(x, y, totalTableWidth - colWidths.amount, 20).fillAndStroke('#F9FAFB', 'black');
//   doc.fillColor('black').font('Devanagari-Bold').fontSize(9);
//   doc.text('TOTAL', x + 3, y + 7, { width: totalTableWidth - colWidths.amount - 6, align: 'right' });
//   x += totalTableWidth - colWidths.amount;
  
//   doc.rect(x, y, colWidths.amount, 20).fillAndStroke('#F9FAFB', 'black');
//   doc.fillColor('black').font('Devanagari-Bold').fontSize(9);
//   doc.text(totalAmount.toLocaleString('en-IN'), x + 3, y + 7, { width: colWidths.amount - 6, align: 'right' });

//   y += 30;
//   doc.font('Devanagari').fontSize(10);
//   doc.text(`Rs. ${totalAmount.toLocaleString('en-IN')}/- (${formatAmountInWords(totalAmount)})`, marginLeft, y);

//   // ✅ SIGNATURES
//   const sigY = 750;
//   const sigLabels = [clf.signatures?.first || 'अध्यक्ष', clf.signatures?.second || 'सचिव', clf.signatures?.third || 'कोषाध्यक्ष'];
//   doc.font('Devanagari-Bold').fontSize(10);
//   sigLabels.forEach((label, i) => {
//     const sx = marginLeft + i * 100;
//     doc.moveTo(sx, sigY).lineTo(sx + 80, sigY).stroke();
//     doc.text(label, sx, sigY + 4, { width: 80, align: 'center' });
//   });

//   res.setHeader('Content-Type', 'application/pdf');
//   res.setHeader('Content-Disposition', `attachment; filename=Resource-Advice-${month}.pdf`);
//   doc.pipe(res);
//   doc.end();
// };


// import { generateCentralPDF } from '../../services/advicePdfEngine.js';
// import { LokosCrp } from './lokosCrp.model.js';
// import { VO } from './vo.model.js';
// import { CLF } from '../clfs/clf.model.js';
// import { Advice } from '../advice/advice.model.js';
// import { ApiError } from '../../utils/ApiError.js';
// import { getISTDateString } from '../../utils/security.js';
// import { generatePatrankPrefix } from '../../utils/generatePatrank.js';

// export const generateResourceAdvicePDF = async (req, res, { type, ids, month, adviceDate, adviceNumber, amounts, selectedBank }) => {
//   try {
//     const clfId = req.user.clfId;
//     const clf = await CLF.findById(clfId);
//     if (!clf) throw ApiError.notFound('CLF not found');

//     let resources = [];
//     if (type === 'LOKOS') {
//       resources = await LokosCrp.find({ _id: { $in: ids }, clfId });
//     } else if (type === 'VO') {
//       resources = await VO.find({ _id: { $in: ids }, clfId });
//     } else {
//       throw ApiError.badRequest('Invalid type');
//     }

//     if (!resources.length) throw ApiError.badRequest('No resources found');
    
//     // ✅ FIX: Amounts array validation
//     if (!amounts || amounts.length !== resources.length) {
//       throw ApiError.badRequest('Amount mismatch. Please refresh and try again.');
//     }

//     const adviceEmployees = resources.map((r, i) => ({
//       sl: i + 1,
//       name: r.name || r.voName,
//       designation: r.designation || 'VO Member',
//       month: month,
//       bankName: r.voName ? r.sachiv?.bankDetails?.bankName : r.bankName,
//       bankAccountNumber: r.voName ? r.sachiv?.bankDetails?.accountNumber : r.accountNumber,
//       branch: r.voName ? r.sachiv?.bankDetails?.branch : r.branch,
//       ifscCode: r.voName ? r.sachiv?.bankDetails?.ifscCode : r.ifscCode,
//       amount: amounts[i] || 0,
//     }));

//     const totalAmount = amounts.reduce((a, b) => a + b, 0);

//     let finalAdviceNumber = adviceNumber ? String(adviceNumber).trim() : '';
//     if (!finalAdviceNumber) {
//       const prefix = generatePatrankPrefix(clf.name);
//       const currentYear = new Date().getFullYear();
//       finalAdviceNumber = `${prefix}/CLF/${currentYear}/`;
//     }

//     // ✅ FIX: Database me save karte waqt strict: false use kiya taaki koi extra validation error na aaye
//     const savedAdvice = new Advice({
//       adviceType: 'EXPENSE',
//       adviceNumber: finalAdviceNumber,
//       adviceDate: adviceDate || getISTDateString(),
//       clfBankDetails: selectedBank,
//       createdByRole: req.user.role,
//       createdByUser: req.user._id,
//       createdByName: req.user.name || '',
//       clfId: clf._id,
//       blockId: clf.blockId,
//       bankName: selectedBank.bankName || '',
//       branch: selectedBank.branch || '',
//       employees: adviceEmployees,
//       totalAmount,
//       totalRows: adviceEmployees.length,
//     });

//     // ✅ Validate bypass karo taaki employeeId ka error na aaye
//     await savedAdvice.save({ validateBeforeSave: false });

//     // ✅ PDF Generate karo
//     const pdfAdvice = { ...savedAdvice.toObject(), adviceNumber: finalAdviceNumber };
//     await generateCentralPDF(res, { advice: pdfAdvice, clf });

//   } catch (error) {
//     console.error("❌ Resource Advice Generate Error:", error);
//     // Agar response pehle se bhej diya gaya hai, toh kuch mat karo
//     if (!res.headersSent) {
//       res.status(500).json({ success: false, message: error.message || 'Failed to generate advice' });
//     }
//   }
// };



import { generateCentralPDF } from '../../services/advicePdfEngine.js';
import { LokosCrp } from './lokosCrp.model.js';
import { VO } from './vo.model.js';
import { CLF } from '../clfs/clf.model.js';
import { Advice } from '../advice/advice.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { getISTDateString } from '../../utils/security.js';
import { generatePatrankPrefix } from '../../utils/generatePatrank.js';

export const generateResourceAdvicePDF = async (req, res, { type, ids, month, adviceDate, adviceNumber, amounts, selectedBank }) => {
  try {
    const clfId = req.user.clfId;
    const clf = await CLF.findById(clfId);
    if (!clf) throw ApiError.notFound('CLF not found');

    let resources = [];
    if (type === 'LOKOS') {
      resources = await LokosCrp.find({ _id: { $in: ids }, clfId });
    } else if (type === 'VO') {
      resources = await VO.find({ _id: { $in: ids }, clfId });
    } else {
      throw ApiError.badRequest('Invalid type');
    }

    if (!resources.length) throw ApiError.badRequest('No resources found');
    if (!amounts || amounts.length !== resources.length) {
      throw ApiError.badRequest('Amount mismatch. Please refresh and try again.');
    }

    const adviceEmployees = resources.map((r, i) => ({
      sl: i + 1,
      name: r.name || r.voName,
      designation: r.designation || 'VO Member',
      month: month,
      bankName: r.voName ? r.sachiv?.bankDetails?.bankName : r.bankName,
      bankAccountNumber: r.voName ? r.sachiv?.bankDetails?.accountNumber : r.accountNumber,
      branch: r.voName ? r.sachiv?.bankDetails?.branch : r.branch,
      ifscCode: r.voName ? r.sachiv?.bankDetails?.ifscCode : r.ifscCode,
      amount: amounts[i] || 0,
    }));

    const totalAmount = amounts.reduce((a, b) => a + Number(b), 0);

    let finalAdviceNumber = adviceNumber ? String(adviceNumber).trim() : '';
    if (!finalAdviceNumber) {
      const prefix = generatePatrankPrefix(clf.name);
      const currentYear = new Date().getFullYear();
      finalAdviceNumber = `${prefix}/CLF/${currentYear}/`;
    }

    // ✅ FIX: Database me save karo with validation bypass
    const savedAdvice = new Advice({
      adviceType: 'EXPENSE',
      adviceNumber: finalAdviceNumber,
      adviceDate: adviceDate || getISTDateString(),
      clfBankDetails: selectedBank,
      createdByRole: req.user.role,
      createdByUser: req.user._id,
      createdByName: req.user.name || '',
      clfId: clf._id,
      blockId: clf.blockId,
      bankName: selectedBank.bankName || '',
      branch: selectedBank.branch || '',
      employees: adviceEmployees,
      totalAmount,
      totalRows: adviceEmployees.length,
    });

    // Validation bypass
    await savedAdvice.save({ validateBeforeSave: false });

    // ✅ PDF Generate karo
    const pdfAdvice = { ...savedAdvice.toObject(), adviceNumber: finalAdviceNumber };
    await generateCentralPDF(res, { advice: pdfAdvice, clf });

  } catch (error) {
    console.error("❌ Resource Advice Generate Error:", error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: error.message || 'Failed to generate advice' });
    }
  }
};