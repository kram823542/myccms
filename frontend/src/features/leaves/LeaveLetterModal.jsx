import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { downloadLeavePdfApi } from './leaves.api';
import { getClf } from '../clfs/clfs.api.js';
import { getAuthUser } from '../../utils/authStorage.js';
import { theme } from '../../config/theme.js';

export default function LeaveLetterModal({ leave, onClose, children }) {
  const [zoom, setZoom] = useState(1);
  const [downloading, setDownloading] = useState(false);
  
  const [clfData, setClfData] = useState(null);
  const [loadingClf, setLoadingClf] = useState(true);

  useEffect(() => {
    const fetchClfData = async () => {
      setLoadingClf(true);
      try {
        let targetClfId = null;
        const user = getAuthUser() || {};
        
        console.log("🔍 [Debug] User:", user);
        console.log("🔍 [Debug] Leave:", leave);

        // ✅ FIX 1: Leave object ke andar hi check karo
        if (leave?.clfId) {
          targetClfId = typeof leave.clfId === 'object' ? leave.clfId._id : leave.clfId;
        }
        // ✅ FIX 2: Agar employeeId populated hai
        else if (leave?.employeeId?.clfId) {
          targetClfId = typeof leave.employeeId.clfId === 'object' ? leave.employeeId.clfId._id : leave.employeeId.clfId;
        }
        // ✅ FIX 3: Local Session Storage me check karo
        else if (user.clfId) {
          targetClfId = typeof user.clfId === 'object' ? user.clfId._id : user.clfId;
        }

        console.log("🎯 [Debug] Target CLF ID Found:", targetClfId);

        if (targetClfId) {
          const res = await getClf(targetClfId);
          console.log("✅ [Debug] CLF Data Fetched:", res.data.data);
          setClfData(res.data.data);
        } else {
          console.warn("⚠️ [Debug] CLF ID nahi mila! Check Backend populate.");
        }
      } catch (err) {
        console.error("❌ [Debug] Failed to load CLF details:", err);
      } finally {
        setLoadingClf(false);
      }
    };

    if (leave) fetchClfData();
  }, [leave]);

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

  const clfName = clfData?.name || '...';
  const subTitle = clfData?.letterhead?.subTitle || '';
  const addressLine = clfData?.letterhead?.addressLine || '';
  
  const subjectText = leave.leaveType === 'Training' 
    ? 'विषय: प्रशिक्षण (Training) हेतु आवेदन' 
    : 'विषय: अवकाश (Leave) हेतु आवेदन';
    
  const bodyLeaveText = leave.leaveType === 'Training' ? 'प्रशिक्षण' : 'अवकाश';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4" style={{ background: theme.colors.overlay, backdropFilter: 'blur(4px)' }}>
      
      <div style={{ background: theme.colors.surface, borderRadius: theme.radius.lg, boxShadow: theme.shadow.lg }} className="w-full max-w-4xl h-[95vh] sm:h-[90vh] flex flex-col overflow-hidden relative">
        
        {/* Toolbar */}
        <div style={{ borderBottom: `1px solid ${theme.colors.border}`, background: theme.colors.background }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 gap-3">
          <h2 style={{ color: theme.colors.text }} className="text-base sm:text-lg font-bold">Leave Application</h2>
          
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-1 bg-white border rounded px-2">
              <button onClick={() => setZoom(z => Math.max(0.5, z - 0.2))} className="p-1 text-sm font-bold hover:opacity-70">A-</button>
              <button onClick={() => setZoom(1)} style={{ color: theme.colors.muted }} className="text-xs px-1 hover:opacity-70">Reset</button>
              <button onClick={() => setZoom(z => Math.min(2, z + 0.2))} className="p-1 text-sm font-bold hover:opacity-70">A+</button>
            </div>
            
            <button 
              onClick={handleDownload} 
              disabled={downloading}
              style={{ background: theme.colors.primary, color: theme.colors.textLight }}
              className="flex-1 sm:flex-none justify-center px-3 py-1.5 sm:px-4 sm:py-2 rounded text-xs sm:text-sm font-medium hover:opacity-90 flex items-center gap-2 disabled:opacity-50"
            >
              {downloading ? 'Downloading...' : (
                <>
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                  PDF
                </>
              )}
            </button>

            <button onClick={onClose} style={{ background: `${theme.colors.danger}20`, color: theme.colors.danger }} className="p-1.5 sm:p-2 rounded hover:opacity-80 transition shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        </div>

        {/* Scrollable Letter Area */}
        <div style={{ background: theme.colors.background }} className="flex-1 overflow-auto p-2 sm:p-8">
          <div 
            style={{ transform: `scale(${zoom})`, background: theme.colors.printSurface, border: `1px solid ${theme.colors.border}`, width: '210mm', minHeight: '297mm', boxShadow: theme.shadow.md }}
            className="mx-auto p-6 sm:p-10 origin-top sm:origin-top-center transition-transform duration-200 ease-out"
          >
            {/* DYNAMIC LETTERHEAD */}
            <div style={{ borderBottom: `2px solid ${theme.colors.text}` }} className="text-center pb-4 mb-6 sm:mb-8">
              {loadingClf ? (
                <div className="flex flex-col items-center gap-2 animate-pulse py-2">
                  <div className="h-7 w-3/4 bg-gray-200 rounded"></div>
                  <div className="h-5 w-1/2 bg-gray-200 rounded"></div>
                  <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
                </div>
              ) : (
                <>
                  <h1 style={{ color: theme.colors.text }} className="text-xl sm:text-2xl font-bold leading-tight">
                    {clfName}
                  </h1>
                  {subTitle && <p style={{ color: theme.colors.text }} className="text-base sm:text-lg font-semibold mt-1">{subTitle}</p>}
                  {addressLine && <p style={{ color: theme.colors.muted }} className="text-xs sm:text-sm mt-1">{addressLine}</p>}
                </>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-2" style={{ color: theme.colors.text }}>
              <div>
                <p className="font-semibold text-base sm:text-lg">प्रति,</p>
                <p className="text-sm sm:text-base">The Manager / Admin</p>
                <p className="text-sm sm:text-base">{loadingClf ? '...' : clfName}</p>
              </div>
              <div className="sm:text-right">
                <p className="text-sm sm:text-base">दिनांक: {formatDate(leave.createdAt)}</p>
              </div>
            </div>

            <div className="mb-6 text-center">
              <p style={{ color: theme.colors.text, borderBottom: `1px solid ${theme.colors.text}` }} className="font-bold text-base sm:text-lg inline-block px-2 sm:px-4 py-1">
                {subjectText}
              </p>
            </div>

            <div className="leading-loose space-y-4 text-justify" style={{ fontSize: '14px', sm: '16px', color: theme.colors.text }}>
              <p>महोदय/महोदया,</p>
              <p>
                सविनय निवेदन है कि मुझे <strong>{leave.totalDays} दिनों</strong> का {bodyLeaveText} चाहिए। 
                मुझे दिनांक <strong>{formatDate(leave.startDate)}</strong> से <strong>{formatDate(leave.endDate)}</strong> तक {bodyLeaveText} की आवश्यकता है
                {leave.leaveType === 'Half Day' && leave.startTime && (
                  <span> (समय: {leave.startTime} से {leave.endTime} तक)</span>
                )}।
              </p>
              <p>
                {bodyLeaveText} का कारण निम्नलिखित है: <br/>
                <span style={{ color: theme.colors.muted, borderLeft: `4px solid ${theme.colors.border}`, background: theme.colors.surfaceAlt }} className="italic block mt-2 p-3 sm:p-4 text-sm sm:text-base">
                  "{leave.reason}"
                </span>
              </p>
              <p>अतः आपसे निवेदन है कि मेरे इस {bodyLeaveText} आवेदन को स्वीकृत (Approve) करने की कृपा करें।</p>
            </div>

            <div className="mt-12 sm:mt-16 flex flex-col sm:flex-row justify-between gap-6" style={{ color: theme.colors.text }}>
              <div><p className="text-sm sm:text-base">धन्यवाद,</p></div>
              <div className="text-center sm:text-left sm:mt-8">
                <p className="font-semibold text-base sm:text-lg">{leave.employeeId?.name || 'Employee Name'}</p>
                <p style={{ color: theme.colors.muted }} className="text-xs sm:text-sm">{leave.employeeId?.designation || 'Designation'}</p>
                <p style={{ color: theme.colors.muted }} className="text-xs sm:text-sm">Emp Code: {leave.employeeId?.employeeCode || 'N/A'}</p>
              </div>
            </div>

            {(leave.status !== 'PENDING' || leave.reviewRemarks) && (
              <div style={{ borderTop: `1px solid ${theme.colors.border}` }} className="mt-12 sm:mt-16 pt-4 sm:pt-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <p style={{ color: theme.colors.muted }} className="text-[10px] sm:text-xs uppercase font-bold">Status</p>
                    <span 
                      style={{ 
                        background: leave.status === 'APPROVED' ? `${theme.colors.success}20` : leave.status === 'REJECTED' ? `${theme.colors.danger}20` : `${theme.colors.warning}20`,
                        color: leave.status === 'APPROVED' ? theme.colors.success : leave.status === 'REJECTED' ? theme.colors.danger : theme.colors.warning
                      }} 
                      className="inline-block mt-1 px-2 sm:px-3 py-1 text-xs sm:text-sm font-bold rounded"
                    >
                      {leave.status === 'APPROVED' ? 'स्वीकृत (APPROVED)' : leave.status === 'REJECTED' ? 'अस्वीकृत (REJECTED)' : 'लंबित (PENDING)'}
                    </span>
                  </div>

                  {leave.reviewRemarks && (
                    <div style={{ background: `${theme.colors.danger}10`, border: `1px solid ${theme.colors.danger}30` }} className="p-2 sm:p-3 rounded w-full sm:max-w-sm">
                      <p style={{ color: theme.colors.danger }} className="text-[10px] sm:text-xs uppercase font-bold">Admin Remark:</p>
                      <p style={{ color: theme.colors.danger }} className="text-xs sm:text-sm mt-1">{leave.reviewRemarks}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {children && (
          <div style={{ borderTop: `1px solid ${theme.colors.border}`, background: theme.colors.background }} className="p-3 sm:p-4 flex justify-center">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}