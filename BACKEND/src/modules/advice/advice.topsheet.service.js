import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Advice } from './advice.model.js';
import { CLF } from '../clfs/clf.model.js';
import { TopSheet } from './topSheet.model.js'; 
import { ApiError } from '../../utils/ApiError.js';
import { logger } from '../../utils/logger.js';
import { generatePatrankPrefix } from '../../utils/generatePatrank.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Fonts Logic ──
const getFontPath = (fontName) => {
  const paths = [
    path.join(process.cwd(), 'assets', 'fonts', fontName),
    path.join(process.cwd(), 'src', 'assets', 'fonts', fontName),
    path.join(__dirname, '..', '..', '..', 'assets', 'fonts', fontName),
  ];
  for (const p of paths) if (fs.existsSync(p)) return p;
  return null;
};
const BUNDLED_FONT_REGULAR = getFontPath('NotoSansDevanagari-Regular.ttf');
const BUNDLED_FONT_BOLD = getFontPath('NotoSansDevanagari-Bold.ttf');
const SYSTEM_FONTS = {
  regular: [BUNDLED_FONT_REGULAR, 'C:\\Windows\\Fonts\\Nirmala.ttf', '/usr/share/fonts/truetype/noto/NotoSansDevanagari-Regular.ttf'].filter(Boolean),
  bold: [BUNDLED_FONT_BOLD, 'C:\\Windows\\Fonts\\NirmalaB.ttf', '/usr/share/fonts/truetype/noto/NotoSansDevanagari-Bold.ttf'].filter(Boolean),
};
const findFont = (candidates) => {
  for (const p of candidates) { try { if (fs.existsSync(p)) return p; } catch {} }
  return null;
};
const registerFonts = (doc) => {
  const regular = findFont(SYSTEM_FONTS.regular);
  const bold = findFont(SYSTEM_FONTS.bold);
  doc.registerFont('Devanagari', regular || 'Helvetica');
  doc.registerFont('Devanagari-Bold', bold || regular || 'Helvetica-Bold');
};

const fetchImageBuffer = async (url) => {
  if (!url) return null;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return Buffer.from(await response.arrayBuffer());
  } catch (err) {
    logger.warn(`⚠️ Logo fetch failed: ${err.message}`);
    return null;
  }
};

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

// ✅ FIX: getBankShortName wapas add kiya
const getBankShortName = (fullName) => {
  if (!fullName) return '';
  const map = { 'state bank of india': 'SBI', 'punjab national bank': 'PNB', 'bank of india': 'BOI', 'bank of baroda': 'BOB', 'canara bank': 'Canara', 'union bank of india': 'UBI', 'indian bank': 'Indian Bank', 'hdfc bank': 'HDFC', 'icici bank': 'ICICI', 'axis bank': 'Axis', 'jharkhand rajya gramin bank': 'JRGB', 'jharkhand gramin bank': 'JGB' };
  return map[fullName.toLowerCase().trim()] || fullName;
};

export const generateTopSheetPDF = async (req, clfId, monthStr, adviceDetails, selectedBank, res) => {
  const clf = await CLF.findById(clfId);
  if (!clf) throw ApiError.notFound('CLF not found');
  if (!monthStr.includes('-')) throw ApiError.badRequest('Month format must be YYYY-MM');
  
  const selectedAdviceIds = adviceDetails.map(d => d.adviceId);

  const advices = await Advice.find({
    _id: { $in: selectedAdviceIds },
    clfId: clf._id,
    isDeleted: false,
  }).sort({ createdAt: 1 });

  if (!advices.length) throw ApiError.badRequest('No advices selected or found');

  let grandTotal = 0;
  const tableRows = [];

  advices.forEach((adv, idx) => {
    const designations = [...new Set(adv.employees.map(e => e.designation || 'N/A'))].join(', ');
    const totalCader = adv.totalRows;
    const bankShortName = getBankShortName(adv.clfBankDetails?.bankName || adv.bankName); 
    const monthDisplay = adv.employees[0]?.month || monthStr;
    const amount = adv.totalAmount;

    grandTotal += amount;
    const input = adviceDetails?.find(d => String(d.adviceId) === String(adv._id)) || {};

    tableRows.push({
      sl: idx + 1,
      designation: designations || 'Mixed',
      month: monthDisplay,
      totalCader,
      bank: bankShortName,
      amount: amount,
      chequeNo: input.chequeNumber || '',
      blockLetter: input.blockLetterNumber || ''
    });
  });

  const leftLogoUrl = clf.letterhead?.leftLogo;
  const rightLogoUrl = clf.letterhead?.rightLogo;
  const [leftLogoBuf, rightLogoBuf] = await Promise.all([fetchImageBuffer(leftLogoUrl), fetchImageBuffer(rightLogoUrl)]);

  const doc = new PDFDocument({ size: 'A4', margin: 0, bufferPages: true, autoFirstPage: false });
  registerFonts(doc);

  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const marginLeft = 30;
  const marginRight = 30;
  const contentWidth = pageWidth - marginLeft - marginRight;

  doc.addPage({ size: 'A4', margin: 0 });
  let y = 30;

  const drawStrip = (yPos) => {
    const h = 8;
    const w1 = contentWidth * 0.3;
    const w2 = contentWidth * 0.7;
    doc.rect(marginLeft, yPos, w1, h).fill('#82c828');
    doc.rect(marginLeft + w1, yPos, w2, h).fill('#e05a10');
    doc.fillColor('black');
  };

  drawStrip(y); y += 18;

  // HEADER
  const logoSize = 70, logoY = y;
  const titleWidth = pageWidth - marginLeft - marginRight - logoSize * 2 - 20;
  const titleX = marginLeft + logoSize + 10;

  if (leftLogoBuf) try { doc.image(leftLogoBuf, marginLeft, logoY, { fit: [logoSize, logoSize] }); } catch {}
  if (rightLogoBuf) try { doc.image(rightLogoBuf, pageWidth - marginRight - logoSize, logoY, { fit: [logoSize, logoSize] }); } catch {}

  let ty = logoY + 5;
  doc.font('Devanagari').fontSize(16).fillColor('black').text(clf.name || '', titleX, ty, { width: titleWidth, align: 'center' });
  ty += doc.heightOfString(clf.name || '', { width: titleWidth }) + 6;
  
  doc.font('Devanagari').fontSize(9).text(clf.letterhead?.addressLine || '', titleX, ty, { width: titleWidth, align: 'center' });
  ty += 14;

  if (clf.letterhead?.registrationNo) {
    doc.text(clf.letterhead.registrationNo, titleX, ty, { width: titleWidth, align: 'center' });
  }

  y = Math.max(logoY + logoSize, ty + 10) + 6;
  drawStrip(y); y += 18;

  // ✅ FIX: Patrank dynamic generate karo
  const prefix = generatePatrankPrefix(clf.name);
  const currentYear = new Date().getFullYear();
  const patrankDisplay = `${prefix}/CLF/${currentYear}/`;

  doc.font('Devanagari').fontSize(10).fillColor('black');
  const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  
  doc.text(`पत्रांक_  ${patrankDisplay}`, marginLeft, y);
  doc.text(`दिनांक - ${dateStr}`, marginLeft, y, { width: contentWidth, align: 'right' });
  y += 18;

  const displayBankName = selectedBank?.bankName || clf.bankAccounts?.[0]?.bankName || 'Bank Name';
  const displayBankBranch = selectedBank?.branch || clf.bankAccounts?.[0]?.branch || '-';
  const displayBankAccNo = selectedBank?.accountNumber || clf.bankAccounts?.[0]?.accountNumber || '-';

  doc.font('Devanagari-Bold').fontSize(10).text('To', marginLeft, y); y += 12;
  doc.font('Devanagari').fontSize(10).text('The Branch Manager', marginLeft, y); y += 12;
  doc.text(displayBankName, marginLeft, y); y += 12;
  doc.text(`Branch: ${displayBankBranch}`, marginLeft, y); y += 12;
  y += 4;

  doc.font('Devanagari-Bold').fontSize(11).text('Subject: Bank Advice for transfer', marginLeft, y, { underline: true }); y += 18;
  doc.font('Devanagari').fontSize(10);
  
  doc.text(`Ref: SB Account number : ${clf.name}, SB A/c No. ${displayBankAccNo}`, marginLeft, y, { width: contentWidth }); y += 24;
  doc.text('Dear Sir,', marginLeft, y); y += 14;

  doc.text(`Please debit a sum of Rs. ${grandTotal.toLocaleString('en-IN')}/- (${formatAmountInWords(grandTotal)})`, marginLeft, y, { width: contentWidth, align: 'justify' });
  y = doc.y + 6;

  doc.text(`From our saving bank account of ${clf.name}, SB A/c No. ${displayBankAccNo}, vide Ch. No. ________________ by the fastest mode of remittance as per the details given below:`, marginLeft, y, { width: contentWidth, align: 'justify' });
  y = doc.y + 15;

  // Table Title
  doc.font('Devanagari-Bold').fontSize(10).text(`TOPSHEET-${monthStr}`, marginLeft, y, { width: contentWidth, align: 'center' }); y += 15;

  // Table Setup
  const colWidths = { sl: 25, cader: 100, month: 55, total: 55, bank: 50, amount: 65, cheque: 55, block: 55 };
  const totalTableWidth = Object.values(colWidths).reduce((a, b) => a + b, 0);
  const startX = marginLeft + (contentWidth - totalTableWidth) / 2;
  const rowHeight = 22;

  let x = startX;
  const headers = [
    { w: colWidths.sl, label: 'Sl.' }, { w: colWidths.cader, label: 'TYPE OF CADER' }, { w: colWidths.month, label: 'MONTH' },
    { w: colWidths.total, label: 'TOTAL\nCADER' }, { w: colWidths.bank, label: 'TRANSFER\nTO BANK' },
    { w: colWidths.amount, label: 'AMOUNT' }, { w: colWidths.cheque, label: 'CHECK\nNO.' }, { w: colWidths.block, label: 'BLOCK\nLETTER NO.' },
  ];

  doc.rect(startX, y, totalTableWidth, rowHeight * 1.5).fill('#F3F4F6');
  doc.fillColor('black').font('Devanagari-Bold').fontSize(7.5);

  headers.forEach((h) => {
    doc.rect(x, y, h.w, rowHeight * 1.5).stroke();
    doc.text(h.label, x + 2, y + 5, { width: h.w - 4, align: 'center' });
    x += h.w;
  });
  y += rowHeight * 1.5;

  // Table Rows
  doc.font('Devanagari').fontSize(8);
  tableRows.forEach((row) => {
    if (y > 700) {
      doc.addPage({ size: 'A4', margin: 0 });
      y = 30;
      drawStrip(y); y += 18;
      doc.font('Devanagari').fontSize(10).text(`TOPSHEET-${monthStr} (Contd...)`, marginLeft, y, { width: contentWidth, align: 'center' }); 
      y += 20;

      x = startX;
      doc.rect(startX, y, totalTableWidth, rowHeight * 1.5).fill('#F3F4F6');
      doc.fillColor('black').font('Devanagari-Bold').fontSize(7.5);
      headers.forEach((h) => {
        doc.rect(x, y, h.w, rowHeight * 1.5).stroke();
        doc.text(h.label, x + 2, y + 5, { width: h.w - 4, align: 'center' });
        x += h.w;
      });
      y += rowHeight * 1.5;
      doc.font('Devanagari').fontSize(8);
    }

    x = startX;
    const caderText = String(row.designation || 'Mixed');
    const caderHeight = doc.heightOfString(caderText, { width: colWidths.cader - 4 });
    const currentRowHeight = Math.max(rowHeight, caderHeight + 6);

    const vals = [
      { w: colWidths.sl, v: row.sl, align: 'center', wrap: false },
      { w: colWidths.cader, v: caderText, align: 'left', wrap: true },
      { w: colWidths.month, v: row.month, align: 'center', wrap: false },
      { w: colWidths.total, v: row.totalCader, align: 'center', wrap: false },
      { w: colWidths.bank, v: row.bank, align: 'center', wrap: false },
      { w: colWidths.amount, v: row.amount.toLocaleString('en-IN'), align: 'right', wrap: false },
      { w: colWidths.cheque, v: row.chequeNo, align: 'center', wrap: false },
      { w: colWidths.block, v: row.blockLetter, align: 'center', wrap: false },
    ];
    
    vals.forEach((v) => {
      doc.rect(x, y, v.w, currentRowHeight).stroke();
      const textY = y + (v.wrap ? 5 : (currentRowHeight - 8) / 2 + 2);
      doc.text(String(v.v), x + 2, textY, { width: v.w - 4, align: v.align, lineBreak: v.wrap ? true : false, ellipsis: !v.wrap });
      x += v.w;
    });
    y += currentRowHeight;
  });

  // Total Row
  x = startX;
  const totalRow = [
    { w: colWidths.sl + colWidths.cader + colWidths.month + colWidths.total + colWidths.bank, v: 'TOTAL', align: 'center', bold: true },
    { w: colWidths.amount, v: grandTotal.toLocaleString('en-IN'), align: 'right', bold: true },
    { w: colWidths.cheque + colWidths.block, v: '', align: 'center', bold: true },
  ];
  totalRow.forEach((v) => {
    doc.rect(x, y, v.w, rowHeight).fillAndStroke('#F9FAFB', 'black');
    doc.fillColor('black').font(v.bold ? 'Devanagari-Bold' : 'Devanagari').fontSize(9);
    doc.text(String(v.v), x + 3, y + 7, { width: v.w - 6, align: v.align });
    x += v.w;
  });
  y += rowHeight + 10;

  doc.font('Devanagari').fontSize(10);
  doc.text(`Rs. ${grandTotal.toLocaleString('en-IN')}/- (${formatAmountInWords(grandTotal)})`, marginLeft, y, { width: contentWidth });
  y = doc.y + 15;

  // Signatures & Footer
  if (y > 650) {
    doc.addPage({ size: 'A4', margin: 0 });
    y = 30;
    drawStrip(y); y += 18;
  }

  const footerTop = pageHeight - 90;
  const sigY = footerTop - 40;
  const sigWidth = 80, gap = 20;
  const sigLabels = [
    clf.signatures?.first || 'अध्यक्ष', 
    clf.signatures?.second || 'सचिव', 
    clf.signatures?.third || 'कोषाध्यक्ष'
  ];

  doc.font('Devanagari-Bold').fontSize(10).fillColor('black');
  sigLabels.forEach((label, i) => {
    const sx = marginLeft + i * (sigWidth + gap);
    doc.moveTo(sx, sigY).lineTo(sx + sigWidth, sigY).stroke();
    doc.text(label, sx, sigY + 4, { width: sigWidth, align: 'center' });
  });

  doc.font('Devanagari-Bold').fontSize(9);
  const rightX = marginLeft + contentWidth - 180;
  doc.text('Thanking You.', rightX, sigY - 30, { width: 180, align: 'right' });
  doc.text(clf.name || '', rightX, sigY - 16, { width: 180, align: 'right' });
  doc.text(clf.letterhead?.subTitle || '', rightX, sigY - 4, { width: 180, align: 'right' });

  drawStrip(footerTop);
  let fy = footerTop + 12;
  doc.font('Devanagari').fontSize(7.5).fillColor('black');
  
  const footerLines = [
    clf.footer?.blockOffice,
    clf.footer?.districtOffice,
    clf.footer?.stateOffice,
    clf.footer?.phone,
  ].filter(Boolean);

  footerLines.forEach((line) => {
    doc.text(line, 0, fy, { width: pageWidth, align: 'center' });
    fy += 10;
  });

  // Save History
  try {
    const summaryAdvices = advices.map(adv => ({
      adviceId: adv._id,
      adviceNumber: adv.adviceNumber || 'N/A',
      designation: [...new Set(adv.employees.map(e => e.designation || 'N/A'))].join(', '),
      totalAmount: adv.totalAmount,
      employees: adv.employees.map(e => ({
        name: e.name, designation: e.designation, amount: e.amount,
        accountNumber: e.bankAccountNumber, bankName: e.bankName, ifscCode: e.ifscCode
      }))
    }));

    await TopSheet.create({
      clfId: clf._id,
      month: monthStr,
      bankName: displayBankName,
      accountNumber: displayBankAccNo,
      adviceCount: advices.length,
      grandTotal,
      createdBy: req.user._id,
      advices: summaryAdvices
    });
  } catch (err) {
    logger.error(`History save failed: ${err.message}`);
  }

  const filename = `TopSheet-${clf.code}-${monthStr}.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  
  doc.pipe(res);
  doc.end();
};