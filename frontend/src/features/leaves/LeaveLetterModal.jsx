import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { downloadLeavePdfApi } from './leaves.api';
import { theme } from '../../config/theme.js';

export default function LeaveLetterModal({ leave, onClose, children }) {
  const [zoom, setZoom] = useState(1);
  const [downloading, setDownloading] = useState(false);

  if (!leave) return null;

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const blob = await downloadLeavePdfApi(leave._id);
      
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Leave-${leave.employeeId?.employeeCode || 'App'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('PDF Downloaded successfully');
    } catch (error) {
      toast.error('Failed to download PDF');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: theme.colors.overlay, backdropFilter: 'blur(4px)' }}>
      
      <div style={{ background: theme.colors.surface, borderRadius: theme.radius.lg, boxShadow: theme.shadow.lg }} className="w-full max-w-3xl h-[90vh] flex flex-col overflow-hidden relative">
        
        {/* Toolbar */}
        <div style={{ borderBottom: `1px solid ${theme.colors.border}`, background: theme.colors.background }} className="flex items-center justify-between p-4">
          <h2 style={{ color: theme.colors.text }} className="text-lg font-bold">Leave Application (आवेदन पत्र)</h2>
          <div className="flex items-center gap-3">
            <button onClick={() => setZoom(z => Math.max(0.5, z - 0.2))} style={{ borderColor: theme.colors.border, background: theme.colors.surface }} className="p-2 border rounded">A-</button>
            <button onClick={() => setZoom(1)} style={{ color: theme.colors.muted }} className="text-sm font-medium hover:opacity-80">Reset</button>
            <button onClick={() => setZoom(z => Math.min(2, z + 0.2))} style={{ borderColor: theme.colors.border, background: theme.colors.surface }} className="p-2 border rounded">A+</button>
            
            <button 
              onClick={handleDownload} 
              disabled={downloading}
              style={{ background: theme.colors.primary, color: theme.colors.textLight }}
              className="ml-4 px-4 py-2 rounded font-medium hover:opacity-90 flex items-center gap-2 disabled:opacity-50"
            >
              {downloading ? 'Downloading...' : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                  Download PDF
                </>
              )}
            </button>

            <button onClick={onClose} style={{ background: `${theme.colors.danger}20`, color: theme.colors.danger }} className="ml-2 p-2 rounded hover:opacity-80 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        </div>

        {/* Scrollable Letter Area */}
        <div style={{ background: theme.colors.background }} className="flex-1 overflow-auto p-8">
          <div 
            style={{ transform: `scale(${zoom})`, background: theme.colors.printSurface, border: `1px solid ${theme.colors.border}`, width: '210mm', minHeight: '297mm', boxShadow: theme.shadow.md }}
            className="mx-auto p-10 origin-top transition-transform duration-200 ease-out"
          >
            {/* Letterhead */}
            <div style={{ borderBottom: `2px solid ${theme.colors.text}` }} className="text-center pb-4 mb-8">
              <h1 style={{ color: theme.colors.text }} className="text-2xl font-bold">सतबरवा आजीविका महिला संकुल स्तरीय</h1>
              <p style={{ color: theme.colors.text }} className="text-lg font-semibold">प्राथमिक स्वावलम्बी सहकारी समिति लिमिटेड</p>
              <p style={{ color: theme.colors.muted }} className="text-sm mt-1">ग्राम- सतबरवा, प्रखंड- सतबरवा, जिला- पलामू (झा0)</p>
            </div>

            <div className="flex justify-between items-start mb-6" style={{ color: theme.colors.text }}>
              <div>
                <p className="font-semibold text-lg">प्रति,</p>
                <p>CLF Admin</p>
                <p>सतबरवा CLF</p>
              </div>
              <div className="text-right">
                <p>दिनांक: {formatDate(leave.createdAt)}</p>
              </div>
            </div>

            <div className="mb-6 text-center">
              <p style={{ color: theme.colors.text, borderBottom: `1px solid ${theme.colors.text}` }} className="font-bold text-lg inline-block px-4 py-1">
                विषय: अवकाश (Leave) हेतु आवेदन
              </p>
            </div>

            <div className="leading-loose space-y-4 text-justify" style={{ fontSize: '16px', color: theme.colors.text }}>
              <p>महोदय/महोदया,</p>
              <p>
                सविनय निवेदन है कि मुझे <strong>{leave.totalDays} दिनों</strong> का अवकाश चाहिए। 
                मुझे दिनांक <strong>{formatDate(leave.startDate)}</strong> से <strong>{formatDate(leave.endDate)}</strong> तक अवकाश की आवश्यकता है
                {leave.leaveType === 'Half Day' && leave.startTime && (
                  <span> (समय: {leave.startTime} से {leave.endTime} तक)</span>
                )}।
              </p>
              <p>
                अवकाश का कारण निम्नलिखित है: <br/>
                <span style={{ color: theme.colors.muted, borderLeft: `4px solid ${theme.colors.border}`, background: theme.colors.surfaceAlt }} className="italic block mt-2 p-4">
                  "{leave.reason}"
                </span>
              </p>
              <p>अतः आपसे निवेदन है कि मेरे इस अवकाश आवेदन को स्वीकृत (Approve) करने की कृपा करें।</p>
            </div>

            <div className="mt-16 flex justify-between" style={{ color: theme.colors.text }}>
              <div><p>धन्यवाद,</p></div>
              <div className="text-center mt-8">
                <p className="font-semibold text-lg">{leave.employeeId?.name || 'Employee Name'}</p>
                <p style={{ color: theme.colors.muted }} className="text-sm">{leave.employeeId?.designation || 'Designation'}</p>
                <p style={{ color: theme.colors.muted }} className="text-sm">Emp Code: {leave.employeeId?.employeeCode || 'N/A'}</p>
              </div>
            </div>

            {(leave.status !== 'PENDING' || leave.reviewRemarks) && (
              <div style={{ borderTop: `1px solid ${theme.colors.border}` }} className="mt-16 pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p style={{ color: theme.colors.muted }} className="text-xs uppercase font-bold">Status</p>
                    <span 
                      style={{ 
                        background: leave.status === 'APPROVED' ? `${theme.colors.success}20` : leave.status === 'REJECTED' ? `${theme.colors.danger}20` : `${theme.colors.warning}20`,
                        color: leave.status === 'APPROVED' ? theme.colors.success : leave.status === 'REJECTED' ? theme.colors.danger : theme.colors.warning
                      }} 
                      className="inline-block mt-1 px-3 py-1 text-sm font-bold rounded"
                    >
                      {leave.status === 'APPROVED' ? 'स्वीकृत (APPROVED)' : leave.status === 'REJECTED' ? 'अस्वीकृत (REJECTED)' : 'लंबित (PENDING)'}
                    </span>
                  </div>

                  {leave.reviewRemarks && (
                    <div style={{ background: `${theme.colors.danger}10`, border: `1px solid ${theme.colors.danger}30` }} className="p-3 rounded max-w-sm">
                      <p style={{ color: theme.colors.danger }} className="text-xs uppercase font-bold">Admin Remark (टिप्पणी):</p>
                      <p style={{ color: theme.colors.danger }} className="text-sm mt-1">{leave.reviewRemarks}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {children && (
          <div style={{ borderTop: `1px solid ${theme.colors.border}`, background: theme.colors.background }} className="p-4 flex justify-center">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}