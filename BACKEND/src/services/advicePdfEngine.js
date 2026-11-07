import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getFontPath = (fontName) => {
  const paths = [
    path.join(process.cwd(), 'assets', 'fonts', fontName),
    path.join(process.cwd(), 'src', 'assets', 'fonts', fontName),
    path.join(__dirname, '..', '..', 'assets', 'fonts', fontName),
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
  const map = { 'state bank of india': 'SBI', 'punjab national bank': 'PNB', 'bank of india': 'BOI', 'bank of baroda': 'BOB', 'canara bank': 'Canara', 'union bank of india': 'UBI', 'indian bank': 'Indian Bank', 'hdfc bank': 'HDFC', 'icici bank': 'ICICI', 'axis bank': 'Axis', 'jharkhand rajya gramin bank': 'JRGB', 'jharkhand gramin bank': 'JGB' };
  return map[fullName.toLowerCase().trim()] || fullName;
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

// ✅ MAIN EXPORT: Ek hi function sabka PDF banayega
export const generateCentralPDF = async (res, { advice, clf }) => {
  const leftLogoBuf = await fetchImageBuffer(clf.letterhead?.leftLogo);
  const rightLogoBuf = await fetchImageBuffer(clf.letterhead?.rightLogo);

  const doc = new PDFDocument({ size: 'A4', margin: 0, bufferPages: true, autoFirstPage: false });
  registerFonts(doc);

  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const marginLeft = 30;
  const marginRight = 30;
  const contentWidth = pageWidth - marginLeft - marginRight;

  const employees = advice.employees;
  const totalAmount = advice.totalAmount;
  const clfBank = advice.clfBankDetails || { bankName: advice.bankName || '-', accountNumber: '-', branch: advice.branch || '-' };

  const PAGE_1_MAX = 5;
  const PAGE_NEXT_MAX = 11;
  const SIGNATURE_FITS_THRESHOLD = 4;

  const chunks = [];
  if (employees.length <= PAGE_1_MAX) chunks.push(employees);
  else {
    chunks.push(employees.slice(0, PAGE_1_MAX));
    let rem = employees.slice(PAGE_1_MAX);
    while (rem.length > 0) { chunks.push(rem.slice(0, PAGE_NEXT_MAX)); rem = rem.slice(PAGE_NEXT_MAX); }
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

    if (leftLogoBuf) try { doc.image(leftLogoBuf, marginLeft, logoY, { fit: [logoSize, logoSize] }); } catch (e) {}
    if (rightLogoBuf) try { doc.image(rightLogoBuf, pageWidth - marginRight - logoSize, logoY, { fit: [logoSize, logoSize] }); } catch (e) {}

    let ty = logoY + 5;
    doc.font('Devanagari').fontSize(16).fillColor('black');
    doc.text(clf.name || '', titleX, ty, { width: titleWidth, align: 'center' });
    const nameHeight = doc.heightOfString(clf.name || '', { width: titleWidth });
    ty += nameHeight + 6;

    doc.font('Devanagari').fontSize(9);
    doc.text(clf.letterhead?.addressLine || '', titleX, ty, { width: titleWidth, align: 'center' });
    ty += 14;

    if (clf.letterhead?.registrationNo) {
      doc.text(clf.letterhead.registrationNo, titleX, ty, { width: titleWidth, align: 'center' });
    }

    y = Math.max(logoY + logoSize, ty + 10) + 6;
    drawStrip(y);
    y += 18;

    doc.font('Devanagari').fontSize(10).fillColor('black');
    const dateStr = new Date(advice.adviceDate).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const adviceNumberText = advice.adviceNumber && advice.adviceNumber.trim() ? advice.adviceNumber : '';

    doc.text(`पत्रांक_  ${adviceNumberText}`, marginLeft, y);
    doc.text(`दिनांक - ${dateStr}`, marginLeft, y, { width: contentWidth, align: 'right' });
    y += 18;

    if (pageIndex === 0) {
      doc.font('Devanagari-Bold').fontSize(10).text('To', marginLeft, y); y += 12;
      doc.font('Devanagari').fontSize(10).text('The Branch Manager', marginLeft, y); y += 12;
      doc.text(clfBank.bankName, marginLeft, y); y += 12;
      if (clfBank.branch) { doc.text(`Branch: ${clfBank.branch}`, marginLeft, y); y += 12; }
      y += 4;
      
      doc.font('Devanagari-Bold').fontSize(11).text('Subject: Bank Advice for transfer', marginLeft, y, { underline: true }); y += 18;
      doc.font('Devanagari').fontSize(10);
      
      doc.text(`Ref: SB Account number : ${clf.name || ''}, SB A/c No. ${clfBank.accountNumber}`, marginLeft, y, { width: contentWidth }); y += 24;
      doc.text('Dear Sir,', marginLeft, y); y += 14;
      
      doc.text(`Please debit a sum of Rs. ${totalAmount.toLocaleString('en-IN')}/- (${formatAmountInWords(totalAmount)})`, marginLeft, y, { width: contentWidth, align: 'justify' });
      y = doc.y + 6;
      
      doc.text(`From our saving bank account of ${clf.name || ''}, SB A/c No. ${clfBank.accountNumber}, vide Ch. No. ________________ by the fastest mode of remittance as per the details given below:`, marginLeft, y, { width: contentWidth, align: 'justify' });
      y = doc.y + 12;
    } else {
      doc.font('Devanagari').fontSize(10);
      doc.text(`(Page ${pageIndex + 1} of ${chunks.length})`, 0, y, { width: pageWidth, align: 'center' });
      y += 18;
    }

    if (!isSignatureOnlyPage) {
      const colWidths = { sl: 20, name: 80, designation: 65, month: 50, bankAccountNumber: 85, bank: 45, branch: 50, ifsc: 60, amount: 65 };
      const totalTableWidth = Object.values(colWidths).reduce((a, b) => a + b, 0);
      const startX = marginLeft + (contentWidth - totalTableWidth) / 2;
      const rowHeight = 20;

      let x = startX;
      const headers = [
        { w: colWidths.sl, label: 'Sl.' }, { w: colWidths.name, label: 'Name' }, { w: colWidths.designation, label: 'Desig' }, 
        { w: colWidths.month, label: 'Month' }, { w: colWidths.bankAccountNumber, label: 'Bank A/c' }, { w: colWidths.bank, label: 'Bank' },
        { w: colWidths.branch, label: 'Branch' }, { w: colWidths.ifsc, label: 'IFSC' }, { w: colWidths.amount, label: 'Amount' },
      ];

      doc.rect(startX, y, totalTableWidth, rowHeight).fill('#F3F4F6');
      doc.fillColor('black').font('Devanagari-Bold').fontSize(8);

      headers.forEach((h) => {
        doc.rect(x, y, h.w, rowHeight).stroke();
        doc.text(h.label, x + 2, y + 6, { width: h.w - 4, align: h.label === 'Amount' ? 'right' : 'left' });
        x += h.w;
      });
      y += rowHeight;

      doc.font('Devanagari').fontSize(8);
      chunk.forEach((emp) => {
        x = startX;
        const nameText = String(emp.name || '-');
        const desigText = String(emp.designation || '-');
        const nameHeight = doc.heightOfString(nameText, { width: colWidths.name - 4 });
        const desigHeight = doc.heightOfString(desigText, { width: colWidths.designation - 4 });
        const currentRowHeight = Math.max(rowHeight, nameHeight + 6, desigHeight + 6);

        const rowValues = [
          { w: colWidths.sl, value: `${emp.sl}.`, align: 'center', wrap: false },
          { w: colWidths.name, value: nameText, align: 'left', wrap: true },
          { w: colWidths.designation, value: desigText, align: 'left', wrap: true },
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
          doc.text(v.value, x + 2, textY, { width: v.w - 4, align: v.align, lineBreak: v.wrap ? true : false, ellipsis: !v.wrap });
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
          doc.fillColor('black').font(v.bold ? 'Devanagari-Bold' : 'Devanagari').fontSize(9);
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
    }
  });

  const safeNumber = (advice.adviceNumber && advice.adviceNumber.trim()) ? advice.adviceNumber.replace(/\//g, '-') : `ADV-${advice._id}`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="Advice-${safeNumber}.pdf"`);
  
  doc.pipe(res);
  doc.end();
};