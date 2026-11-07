import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useReactToPrint } from 'react-to-print';
import { getBankShortName, formatAmountInWords } from './AdviceUtils';
import { theme } from '../../config/theme.js';

const AdviceFormate = ({ advicePreview, clfData }) => {
  const printRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Bank-Advice-${advicePreview?.adviceNumber || 'Preview'}`,
    pageStyle: `@page { size: A4 portrait; margin: 0; } ...`,
  });

  useEffect(() => {
    window.__adviceFormatePrint = handlePrint;
    return () => { delete window.__adviceFormatePrint; };
  }, [handlePrint]);

  if (!advicePreview || !advicePreview.employees || advicePreview.employees.length === 0) return null;

  const totalAmount = advicePreview.employees.reduce((sum, emp) => sum + Number(emp.amount || 0), 0);
  const adviceNumberDisplay = advicePreview.adviceNumber || '—';
  const clfBank = advicePreview.clfBankDetails || { bankName: '-', accountNumber: '-', branch: '-' };

  // ✅ Fallback if clfData missing
  const letterhead = clfData?.letterhead || {};
  const footer = clfData?.footer || {};
  const signatures = clfData?.signatures || {};
  const leftLogo = letterhead.leftLogo || 'https://res.cloudinary.com/dsjnikk42/image/upload/v1789380290/WhatsApp_Image_2026-09-14_at_1.07.08_PM_nbbmda.jpg';
  const rightLogo = letterhead.rightLogo || 'https://res.cloudinary.com/dsjnikk42/image/upload/v1789380471/WhatsApp_Image_2026-09-14_at_1.07.10_PM_owpahi.jpg';
  const clfName = clfData?.name || 'CLF Name';

  const PAGE_1_MAX = 5;
  const PAGE_NEXT_MAX = 11;
  const SIGNATURE_FITS_THRESHOLD = 4;

  const employees = advicePreview.employees;
  const employeeChunks = [];

  if (employees.length <= PAGE_1_MAX) {
    employeeChunks.push(employees);
  } else {
    employeeChunks.push(employees.slice(0, PAGE_1_MAX));
    let remaining = employees.slice(PAGE_1_MAX);
    while (remaining.length > 0) {
      employeeChunks.push(remaining.slice(0, PAGE_NEXT_MAX));
      remaining = remaining.slice(PAGE_NEXT_MAX);
    }
  }

  const lastChunk = employeeChunks[employeeChunks.length - 1];
  if (lastChunk.length > SIGNATURE_FITS_THRESHOLD) {
    employeeChunks.push([]);
  }

  const renderPageCard = (chunk, pageIndex, isPrintMode) => {
    const isLastPage = pageIndex === employeeChunks.length - 1;
    const isSignatureOnlyPage = isLastPage && chunk.length === 0;

    return (
      <div key={pageIndex} className={`print-page-card print-text print-surface w-[210mm] h-[296mm] box-border p-[8mm_10mm] font-sans leading-snug flex flex-col overflow-hidden ${isPrintMode ? '' : 'shadow-lg'}`}>
        <div className="flex-1 min-h-0 flex flex-col">
          
          <div className="flex w-full h-[7px] mb-3 shrink-0">
            <div className="w-[30%] print-accent-green"></div>
            <div className="w-[70%] print-accent-orange"></div>
          </div>

          {/* ✅ DYNAMIC HEADER */}
          <div className="flex items-center justify-between gap-3 pb-3 shrink-0">
            <img src={leftLogo} alt="Left Logo" className="w-[100px] h-[100px] object-contain" crossOrigin="anonymous" />
            <div className="flex-1 text-center font-serif">
              <h1 className="text-[28px] font-extrabold leading-tight m-0">{clfName}</h1>
              {letterhead.subTitle && <h2 className="text-[22px] font-bold leading-tight mt-1 m-0">{letterhead.subTitle}</h2>}
              {letterhead.addressLine && <p className="text-[14px] font-semibold mt-1.5 mb-0">{letterhead.addressLine}</p>}
              {letterhead.registrationNo && <p className="text-[14px] font-semibold mt-1 mb-0">निबंधन संख्या :- {letterhead.registrationNo}</p>}
            </div>
            <img src={rightLogo} alt="Right Logo" className="w-[100px] h-[100px] object-contain" crossOrigin="anonymous" />
          </div>

          <div className="flex w-full h-[7px] mt-2 mb-3 shrink-0">
            <div className="w-[30%] print-accent-green"></div>
            <div className="w-[70%] print-accent-orange"></div>
          </div>

          <div className="flex justify-between text-[16px] font-semibold my-2 shrink-0">
            <p className="m-0">पत्रांक - {adviceNumberDisplay}</p>
            <p className="m-0">दिनांक - {new Date(advicePreview.adviceDate).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
          </div>

          {pageIndex === 0 && (
            <>
              <div className="text-[16px] mb-2 font-medium shrink-0">
                <p className="font-bold m-0">To</p>
                <p className="m-0">The Branch Manager</p>
                <p className="m-0">{clfBank.bankName}</p>
                {clfBank.branch && <p className="m-0">Branch: {clfBank.branch}</p>}
              </div>

              <div className="text-[16px] mb-2 shrink-0">
                <p className="font-bold m-0 underline">Subject: Bank Advice for transfer</p>
              </div>

              <div className="text-[16px] mb-2 shrink-0">
                <p className="m-0">
                  <strong>Ref:</strong> SB Account number : {clfName}, SB A/c No.
                  <strong> {clfBank.accountNumber}</strong>
                </p>
              </div>

              <p className="text-[16px] my-2 shrink-0">Dear Sir,</p>

              <p className="text-[16px] mb-3 text-justify indent-8 m-0 leading-relaxed shrink-0">
                Please debit a sum of Rs. <strong>{totalAmount.toLocaleString('en-IN')}/-</strong> ({formatAmountInWords(totalAmount)}) From our saving bank account of {clfName}, SB A/c No. <strong>{clfBank.accountNumber}</strong> by the fastest mode of remittance as per the details given below:
              </p>
            </>
          )}

          {!isSignatureOnlyPage && (
            <div className="mb-2">
              {employeeChunks.length > 1 && (
                <p className="text-center font-bold text-[15px] my-2"><span className="font-normal">(Page {pageIndex + 1} of {employeeChunks.length})</span></p>
              )}

              <table className="w-full border-collapse border print-border table-fixed">
                <thead>
                  <tr className="print-header">
                    <th className="border print-border p-1.5 font-bold text-center text-[14px] w-[4%]">Sl.</th>
                    <th className="border print-border p-1.5 font-bold text-left text-[14px] w-[16%]">Name</th>
                    <th className="border print-border p-1.5 font-bold text-left text-[14px] w-[10%]">Desig</th>
                    <th className="border print-border p-1.5 font-bold text-left text-[13px] w-[10%]">Month</th>
                    <th className="border print-border p-1.5 font-bold text-left text-[14px] w-[19%]">Bank A/c</th>
                    <th className="border print-border p-1.5 font-bold text-left text-[14px] w-[8%]">Bank</th>
                    <th className="border print-border p-1.5 font-bold text-left text-[14px] w-[10%]">Branch</th>
                    <th className="border print-border p-1.5 font-bold text-left text-[13px] w-[12%]">IFSC</th>
                    <th className="border print-border p-1.5 font-bold text-right text-[14px] w-[11%]">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {chunk.map((emp, idx) => {
                    const globalIdx = pageIndex === 0 ? idx + 1 : PAGE_1_MAX + (pageIndex - 1) * PAGE_NEXT_MAX + idx + 1;
                    return (
                      <tr key={emp._id || idx}>
                        <td className="border print-border p-1.5 text-center text-[15px] font-semibold">{globalIdx}.</td>
                        <td className="border print-border p-1.5 break-words font-semibold text-[15px]">{emp.name}</td>
                        <td className="border print-border p-1.5 break-words text-[14px]">{emp.designation || '-'}</td>
                        <td className="border print-border p-1.5 whitespace-nowrap text-[14px]">{emp.month || '-'}</td>
                        <td className="border print-border p-1.5 font-mono text-[14px] font-bold break-all">{emp.bankAccountNumber || '-'}</td>
                        <td className="border print-border p-1.5 break-words text-[14px] font-semibold">{getBankShortName(emp.bankName)}</td>
                        <td className="border print-border p-1.5 break-words text-[14px]">{emp.branch || '-'}</td>
                        <td className="border print-border p-1.5 font-mono text-[13px] font-bold break-all">{emp.ifscCode || '-'}</td>
                        <td className="border print-border p-1.5 text-right font-bold whitespace-nowrap text-[15px]">{Number(emp.amount || 0).toLocaleString('en-IN')}</td>
                      </tr>
                    );
                  })}
                  {isLastPage && chunk.length > 0 && (
                    <tr className="print-total">
                      <td colSpan="8" className="border print-border p-1.5 text-right font-bold text-[16px]">TOTAL</td>
                      <td className="border print-border p-1.5 text-right font-bold text-[16px] whitespace-nowrap">{totalAmount.toLocaleString('en-IN')}.00</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {isLastPage && chunk.length > 0 && (
                <p className="text-[15px] mt-2 mb-0 font-semibold">Rs. <strong>{totalAmount.toLocaleString('en-IN')}/-</strong> ({formatAmountInWords(totalAmount)})</p>
              )}
            </div>
          )}

          {isLastPage && <div className="flex-1 min-h-[10mm]"></div>}

          {/* ✅ DYNAMIC SIGNATURES */}
          {isLastPage && (
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
                  {letterhead.subTitle && <p className="m-0 font-bold">{letterhead.subTitle}</p>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ✅ DYNAMIC FOOTER */}
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

      <div className="print-preview p-4 rounded overflow-auto w-full" style={{ maxHeight: '70vh' }}>
        <div className="flex flex-col items-center gap-8">
          {employeeChunks.map((chunk, pageIndex) => (
            <div key={pageIndex} style={{ transform: 'scale(0.7)', transformOrigin: 'top center', marginBottom: '-85mm' }}>
              {renderPageCard(chunk, pageIndex, false)}
            </div>
          ))}
        </div>
      </div>

      {mounted && createPortal(
        <div style={{ position: 'fixed', left: '-10000px', top: 0, width: '210mm', zIndex: -1 }} aria-hidden="true">
          <div ref={printRef} className="print-root print-surface">
            {employeeChunks.map((chunk, pageIndex) => renderPageCard(chunk, pageIndex, true))}
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default AdviceFormate;