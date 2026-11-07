import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useReactToPrint } from 'react-to-print';
import { getBankShortName, formatAmountInWords } from './AdviceUtils';
import { theme } from '../../config/theme.js';

const TopSheetFormate = ({ topSheetData, clfBank, month, inputs, clfData }) => {
  const printRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `TopSheet-${month || 'Month'}`,
    pageStyle: `
      @page { size: A4 portrait; margin: 0; }
      @media print {
        html, body {
          width: 210mm !important;
          margin: 0 !important;
          padding: 0 !important;
          background: ${theme.colors.printSurface} !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body * { visibility: hidden !important; }
        .print-root, .print-root * { visibility: visible !important; }
        .print-root {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 210mm !important;
          display: block !important;
        }
        .print-page-card {
          width: 210mm !important;
          height: 296mm !important;
          box-sizing: border-box !important;
          page-break-after: always !important;
          break-after: page !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          box-shadow: none !important;
          margin: 0 !important;
          padding: 8mm 10mm !important;
          overflow: hidden !important;
          display: flex !important;
          flex-direction: column !important;
          background: ${theme.colors.printSurface} !important;
        }
        .print-page-card:last-child {
          page-break-after: auto !important;
          break-after: auto !important;
        }
      }
    `,
  });

  useEffect(() => {
    window.__topSheetFormatePrint = handlePrint;
    window.__topSheetFormateDownload = handlePrint;
    return () => {
      delete window.__topSheetFormatePrint;
      delete window.__topSheetFormateDownload;
    };
  }, [handlePrint]);

  if (!topSheetData || topSheetData.length === 0) {
    return null;
  }

  const grandTotal = topSheetData.reduce((sum, row) => sum + Number(row.totalAmount || 0), 0);
  const bank = clfBank || { bankName: '-', accountNumber: '-', branch: '-' };

  // ✅ 100% Dynamic Data
  const letterhead = clfData?.letterhead || {};
  const footer = clfData?.footer || {};
  const signatures = clfData?.signatures || {};

  const leftLogo = letterhead.leftLogo || 'https://res.cloudinary.com/dsjnikk42/image/upload/v1789380290/WhatsApp_Image_2026-09-14_at_1.07.08_PM_nbbmda.jpg';
  const rightLogo = letterhead.rightLogo || 'https://res.cloudinary.com/dsjnikk42/image/upload/v1789380471/WhatsApp_Image_2026-09-14_at_1.07.10_PM_owpahi.jpg';
  
  const clfName = clfData?.name || ''; // ✅ No Hardcoding
  const subTitle = letterhead.subTitle || '';
  const addressLine = letterhead.addressLine || '';
  const regNo = letterhead.registrationNo || '';

  const renderPageCard = (isPrintMode) => {
    return (
      <div
        className={`print-page-card print-text print-surface w-[210mm] min-h-[296mm] box-border p-[8mm_10mm] font-sans leading-snug flex flex-col overflow-hidden ${
          isPrintMode ? '' : 'shadow-lg'
        }`}
      >
        <div className="flex-1 min-h-0 flex flex-col">
          
          <div className="flex w-full h-[7px] mb-3 shrink-0">
            <div className="w-[30%] print-accent-green"></div>
            <div className="w-[70%] print-accent-orange"></div>
          </div>

          <div className="flex items-center justify-between gap-3 pb-3 shrink-0">
            <img src={leftLogo} alt="Left Logo" className="w-[100px] h-[100px] object-contain" crossOrigin="anonymous" />
            <div className="flex-1 text-center font-serif">
              <h1 className="text-[28px] font-extrabold leading-tight m-0">{clfName || 'CLF Name'}</h1>
              {subTitle && <h2 className="text-[22px] font-bold leading-tight mt-1 m-0">{subTitle}</h2>}
              {addressLine && <p className="text-[14px] font-semibold mt-1.5 mb-0">{addressLine}</p>}
              {regNo && <p className="text-[14px] font-semibold mt-1 mb-0">निबंधन संख्या :- {regNo}</p>}
            </div>
            <img src={rightLogo} alt="Right Logo" className="w-[100px] h-[100px] object-contain" crossOrigin="anonymous" />
          </div>

          <div className="flex w-full h-[7px] mt-2 mb-3 shrink-0">
            <div className="w-[30%] print-accent-green"></div>
            <div className="w-[70%] print-accent-orange"></div>
          </div>

          <div className="flex justify-between text-[16px] font-semibold my-2 shrink-0">
            <p className="m-0">पत्रांक - </p>
            <p className="m-0">दिनांक - {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
          </div>

          <div className="text-[16px] mb-2 font-medium shrink-0">
            <p className="font-bold m-0">To</p>
            <p className="m-0">The Branch Manager</p>
            <p className="m-0">{bank.bankName}</p>
            {bank.branch && <p className="m-0">Branch: {bank.branch}</p>}
          </div>

          <div className="text-[16px] mb-2 shrink-0">
            <p className="font-bold m-0 underline">Subject: Bank Advice for transfer</p>
          </div>

          <div className="text-[16px] mb-2 shrink-0">
            <p className="m-0"><strong>Ref:</strong> SB Account number : {clfName}, SB A/c No. <strong> {bank.accountNumber}</strong></p>
          </div>

          <p className="text-[16px] my-2 shrink-0">Dear Sir,</p>

          <p className="text-[16px] mb-3 text-justify indent-8 m-0 leading-relaxed shrink-0">
            Please debit a sum of Rs. <strong>{grandTotal.toLocaleString('en-IN')}/-</strong> ({formatAmountInWords(grandTotal)}) From our saving bank account of {clfName}, SB A/c No. <strong>{bank.accountNumber}</strong>, vide Ch. No. ________________ by the fastest mode of remittance as per the details given below:
          </p>

          <div className="text-center font-bold text-[16px] mb-2 underline shrink-0">
            TOPSHEET-{month || 'MONTH'}
          </div>

          <div className="mb-2">
            <table className="w-full border-collapse border print-border table-fixed">
              <thead>
                <tr className="print-header">
                  <th className="border print-border p-1 font-bold text-center text-[13px] w-[4%]">Sl.</th>
                  <th className="border print-border p-1 font-bold text-left text-[13px] w-[22%]">TYPE OF CADER</th>
                  <th className="border print-border p-1 font-bold text-center text-[13px] w-[11%]">MONTH</th>
                  <th className="border print-border p-1 font-bold text-center text-[13px] w-[9%]">TOTAL<br/>CADER</th>
                  <th className="border print-border p-1 font-bold text-center text-[13px] w-[10%]">TRANSFER<br/>TO BANK</th>
                  <th className="border print-border p-1 font-bold text-right text-[13px] w-[13%]">AMOUNT</th>
                  <th className="border print-border p-1 font-bold text-center text-[13px] w-[13%]">CHECK<br/>NO.</th>
                  <th className="border print-border p-1 font-bold text-center text-[13px] w-[18%]">BLOCK<br/>LETTER NO.</th>
                </tr>
              </thead>
              <tbody>
                {topSheetData.map((row, idx) => {
                  const cheque = inputs?.[row.adviceId]?.chequeNumber || '';
                  const block = inputs?.[row.adviceId]?.blockLetterNumber || '';
                  return (
                    <tr key={row.adviceId || idx}>
                      <td className="border print-border p-1.5 text-center text-[14px] font-semibold">{idx + 1}.</td>
                      <td className="border print-border p-1.5 break-words text-[14px] font-semibold uppercase">{row.designation || 'MIXED'}</td>
                      <td className="border print-border p-1.5 text-center text-[14px]">{row.month || '-'}</td>
                      <td className="border print-border p-1.5 text-center text-[14px]">{row.totalCader || 0}</td>
                      <td className="border print-border p-1.5 text-center text-[14px] font-semibold">{getBankShortName(row.bankName)}</td>
                      <td className="border print-border p-1.5 text-right font-bold text-[14px] whitespace-nowrap">{Number(row.totalAmount || 0).toLocaleString('en-IN')}</td>
                      <td className="border print-border p-1.5 text-center text-[14px] font-mono">{cheque}</td>
                      <td className="border print-border p-1.5 text-center text-[14px] font-mono">{block}</td>
                    </tr>
                  );
                })}
                <tr className="print-total">
                  <td colSpan="5" className="border print-border p-1.5 text-right font-bold text-[15px]">TOTAL</td>
                  <td className="border print-border p-1.5 text-right font-bold text-[15px] whitespace-nowrap">{grandTotal.toLocaleString('en-IN')}.00</td>
                  <td colSpan="2" className="border print-border p-1.5"></td>
                </tr>
              </tbody>
            </table>

            <p className="text-[15px] mt-2 mb-0 font-semibold">Rs. <strong>{grandTotal.toLocaleString('en-IN')}/-</strong> ({formatAmountInWords(grandTotal)})</p>
          </div>

          <div className="flex-1 min-h-[10mm]"></div>

          <div className="pb-10 shrink-0">
            <div className="flex justify-between items-end">
              <div className="flex gap-6">
                <div className="text-center text-[15px] w-28"><div className="h-4"></div><p className="border-t print-border pt-1 font-bold m-0">{signatures.first || 'अध्यक्ष'}</p></div>
                <div className="text-center text-[15px] w-28"><div className="h-4"></div><p className="border-t print-border pt-1 font-bold m-0">{signatures.second || 'सचिव'}</p></div>
                <div className="text-center text-[15px] w-28"><div className="h-4"></div><p className="border-t print-border pt-1 font-bold m-0">{signatures.third || 'कोषाध्यक्ष'}</p></div>
              </div>
              <div className="text-right text-[12px] leading-snug">
                <p className="font-bold m-0">Thanking You.</p>
                <p className="mt-1 m-0 font-bold">{clfName}</p>
                {subTitle && <p className="m-0 font-bold">{subTitle}</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full pt-1 pb-0 mt-auto shrink-0">
          <div className="flex w-full h-[5px] mb-1.5">
            <div className="w-[30%] print-accent-green"></div>
            <div className="w-[70%] print-accent-orange"></div>
          </div>
          <div className="text-center text-[12px] leading-tight space-y-[1px]">
            {footer.blockOffice && <p className="m-0"><strong>प्रखंड कार्यालय :-</strong> {footer.blockOffice.replace('प्रखंड कार्यालय :-', '').trim()}</p>}
            {footer.districtOffice && <p className="m-0"><strong>जिला कार्यालय :-</strong> {footer.districtOffice.replace('जिला कार्यालय :-', '').trim()}</p>}
            {footer.stateOffice && <p className="m-0"><strong>राज्य कार्यालय :-</strong> {footer.stateOffice.replace('राज्य कार्यालय :-', '').trim()}</p>}
            {footer.phone && <p className="m-0 pt-[1px]"><strong>फोन नं0</strong> {footer.phone.replace('फोन नं0', '').trim()}</p>}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{`
        .print-text { color: ${theme.colors.printText}; }
        .print-surface { background-color: ${theme.colors.printSurface}; }
        .print-border { border-color: ${theme.colors.printBorder}; }
        .print-header { background-color: ${theme.colors.printHeader}; }
        .print-total { background-color: ${theme.colors.printTotal}; }
        .print-preview { background-color: ${theme.colors.printPreview}; }
        .print-accent-green { background-color: ${theme.colors.printAccentGreen}; }
        .print-accent-orange { background-color: ${theme.colors.printAccentOrange}; }
      `}</style>

      <div className="print-preview p-4 rounded overflow-auto w-full" style={{ maxHeight: '80vh' }}>
        <div className="flex flex-col items-center gap-8">
          <div style={{ transform: 'scale(0.75)', transformOrigin: 'top center', marginBottom: '-75mm' }}>
            {renderPageCard(false)}
          </div>
        </div>
      </div>

      {mounted && createPortal(
        <div style={{ position: 'fixed', left: '-10000px', top: 0, width: '210mm', zIndex: -1 }} aria-hidden="true">
          <div ref={printRef} className="print-root print-surface">
            {renderPageCard(true)}
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default TopSheetFormate;