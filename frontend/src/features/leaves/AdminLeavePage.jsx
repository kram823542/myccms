import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/ui/Loader';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import LeaveLetterModal from './LeaveLetterModal';
import { getAllLeavesApi, updateLeaveStatusApi } from './leaves.api';
import { theme } from '../../config/theme.js';

export default function AdminLeavePage() {
  const [leaves, setLeaves] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [rejectModal, setRejectModal] = useState({ open: false, leaveId: null, reason: '' });

  const fetchLeaves = async () => {
    try {
      setFetching(true);
      const res = await getAllLeavesApi();
      setLeaves(res.data);
    } catch  {
      toast.error('Failed to load leaves');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => { void Promise.resolve().then(fetchLeaves); }, []);

  const handleApprove = async (id) => {
    if (!window.confirm('Are you sure you want to approve this leave?')) return;
    try {
      await updateLeaveStatusApi(id, 'APPROVED', '');
      toast.success('Leave Approved');
      setSelectedLeave(null);
      fetchLeaves();
    } catch  {
      toast.error('Failed to approve leave');
    }
  };

  const handleRejectClick = (id) => setRejectModal({ open: true, leaveId: id, reason: '' });

  const submitReject = async () => {
    if (!rejectModal.reason.trim()) return toast.error('Please enter a reason');
    try {
      await updateLeaveStatusApi(rejectModal.leaveId, 'REJECTED', rejectModal.reason);
      toast.success('Leave Rejected');
      setRejectModal({ open: false, leaveId: null, reason: '' });
      setSelectedLeave(null);
      fetchLeaves();
    } catch  {
      toast.error('Failed to reject leave');
    }
  };

  return (
    <div style={{ background: theme.colors.background, minHeight: '100vh', padding: 'clamp(12px, 3vw, 24px)', boxSizing: 'border-box', width: '100%', overflowX: 'hidden' }}>
      <div className="max-w-7xl mx-auto relative" style={{ width: '100%', boxSizing: 'border-box' }}>
        <PageHeader title="Employee Leaves" subtitle="Review and manage leave applications" />

        <div style={{ background: theme.colors.surface, borderRadius: theme.radius.md, boxShadow: theme.shadow.sm, border: `1px solid ${theme.colors.border}`, marginTop: '16px', overflow: 'hidden', width: '100%', boxSizing: 'border-box' }}>
          {fetching ? (
            <div className="py-20 flex justify-center"><Loader /></div>
          ) : leaves.length === 0 ? (
            <div style={{ color: theme.colors.muted }} className="text-center py-20 text-sm">No leave applications found.</div>
          ) : (
            <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table className="w-full text-left border-collapse" style={{ minWidth: 500 }}>
                <thead>
                  <tr style={{ background: theme.colors.background, color: theme.colors.muted, borderBottom: `1px solid ${theme.colors.border}` }} className="text-xs sm:text-sm">
                    <th className="p-3 sm:p-4 font-semibold">Employee</th>
                    <th className="p-3 sm:p-4 font-semibold">Type & Dates</th>
                    <th className="p-3 sm:p-4 font-semibold">Status</th>
                    <th className="p-3 sm:p-4 font-semibold text-right sm:text-left">Action</th>
                  </tr>
                </thead>
                <tbody style={{ color: theme.colors.text }} className="text-xs sm:text-sm">
                  {leaves.map((leave) => (
                    <tr key={leave._id} style={{ borderBottom: `1px solid ${theme.colors.border}`, '--theme-hover-color': theme.colors.overlaySubtle }} className="theme-hover-row">
                      <td className="p-3 sm:p-4">
                        <div className="font-medium truncate max-w-[120px] sm:max-w-none">{leave.employeeId?.name || 'Unknown'}</div>
                        <div style={{ color: theme.colors.muted }} className="text-[10px] sm:text-xs">{leave.employeeId?.employeeCode}</div>
                      </td>
                      <td style={{ color: theme.colors.muted }} className="p-3 sm:p-4">
                        <div style={{ color: theme.colors.text }} className="font-medium">{leave.leaveType}</div>
                        <div className="text-[11px] sm:text-xs">
                          {new Date(leave.startDate).toLocaleDateString('en-IN')} {leave.startDate !== leave.endDate && ` - ${new Date(leave.endDate).toLocaleDateString('en-IN')}`}
                        </div>
                      </td>
                      <td className="p-3 sm:p-4"><Badge variant={leave.status === 'APPROVED' ? 'success' : leave.status === 'REJECTED' ? 'danger' : 'warning'}>{leave.status}</Badge></td>
                      <td className="p-3 sm:p-4 text-right sm:text-left">
                        <Button size="sm" variant="outline" onClick={() => setSelectedLeave(leave)}>View</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selectedLeave && (
          <LeaveLetterModal leave={selectedLeave} onClose={() => setSelectedLeave(null)}>
            {selectedLeave.status === 'PENDING' && (
              <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t w-full max-w-3xl mx-auto box-sizing-border" style={{ borderColor: theme.colors.border }}>
                <Button onClick={() => handleApprove(selectedLeave._id)} variant="success" style={{ flex: 1 }}> Approve Leave</Button>
                <Button onClick={() => handleRejectClick(selectedLeave._id)} variant="danger" style={{ flex: 1 }}> Reject Leave</Button>
              </div>
            )}
          </LeaveLetterModal>
        )}

        {rejectModal.open && (
          <div className="fixed inset-0 flex items-center justify-center z-[60] p-4" style={{ background: theme.colors.overlay, boxSizing: 'border-box' }}>
            <div style={{ background: theme.colors.surface, borderRadius: theme.radius.md, boxShadow: theme.shadow.lg, width: '100%', maxWidth: 440 }} className="p-5 sm:p-6 box-sizing-border">
              <h3 style={{ color: theme.colors.text }} className="text-base sm:text-lg font-bold mb-3">Reject Leave Application</h3>
              <textarea value={rejectModal.reason} onChange={(e) => setRejectModal(prev => ({ ...prev, reason: e.target.value }))}
                style={{ width: '100%', border: `1px solid ${theme.colors.border}`, borderRadius: theme.radius.sm, padding: '10px', color: theme.colors.text, outline: 'none', boxSizing: 'border-box', fontSize: 14 }} rows="3" placeholder="Enter rejection reason..."
              ></textarea>
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 mt-5">
                <Button variant="ghost" onClick={() => setRejectModal({ open: false, leaveId: null, reason: '' })}>Cancel</Button>
                <Button variant="danger" onClick={submitReject}>Confirm Reject</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}