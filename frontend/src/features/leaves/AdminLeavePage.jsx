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
    } catch (error) {
      toast.error('Failed to load leaves');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => { fetchLeaves(); }, []);

  const handleApprove = async (id) => {
    if (!window.confirm('Are you sure you want to approve this leave?')) return;
    try {
      await updateLeaveStatusApi(id, 'APPROVED', '');
      toast.success('Leave Approved');
      setSelectedLeave(null);
      fetchLeaves();
    } catch (error) {
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
    } catch (error) {
      toast.error('Failed to reject leave');
    }
  };

  return (
    <div style={{ background: theme.colors.background, minHeight: '100vh', padding: '24px' }}>
      <div className="max-w-7xl mx-auto relative">
        <PageHeader title="Employee Leaves" subtitle="Review and manage leave applications" />

        <div style={{ background: theme.colors.surface, borderRadius: theme.radius.md, boxShadow: theme.shadow.sm, border: `1px solid ${theme.colors.border}`, marginTop: '24px', overflow: 'hidden' }}>
          {fetching ? (
            <div className="py-20 flex justify-center"><Loader /></div>
          ) : leaves.length === 0 ? (
            <div style={{ color: theme.colors.muted }} className="text-center py-20">No leave applications found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr style={{ background: theme.colors.background, color: theme.colors.muted, borderBottom: `1px solid ${theme.colors.border}` }} className="text-sm">
                    <th className="p-4 font-semibold">Employee</th>
                    <th className="p-4 font-semibold">Type & Dates</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody style={{ color: theme.colors.text }} className="text-sm">
                  {leaves.map((leave) => (
                    <tr key={leave._id} style={{ borderBottom: `1px solid ${theme.colors.border}`, '--theme-hover-color': theme.colors.overlaySubtle }} className="theme-hover-row">
                      <td className="p-4">
                        <div className="font-medium">{leave.employeeId?.name || 'Unknown'}</div>
                        <div style={{ color: theme.colors.muted }} className="text-xs">{leave.employeeId?.employeeCode}</div>
                      </td>
                      <td style={{ color: theme.colors.muted }} className="p-4">
                        <div style={{ color: theme.colors.text }} className="font-medium">{leave.leaveType}</div>
                        {new Date(leave.startDate).toLocaleDateString('en-IN')} {leave.startDate !== leave.endDate && ` - ${new Date(leave.endDate).toLocaleDateString('en-IN')}`}
                      </td>
                      <td className="p-4"><Badge variant={leave.status === 'APPROVED' ? 'success' : leave.status === 'REJECTED' ? 'danger' : 'warning'}>{leave.status}</Badge></td>
                      <td className="p-4"><Button size="sm" variant="outline" onClick={() => setSelectedLeave(leave)}>View Letter</Button></td>
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
              <div className="flex gap-4 mt-6 pt-4 border-t w-full max-w-3xl mx-auto" style={{ borderColor: theme.colors.border }}>
                <Button onClick={() => handleApprove(selectedLeave._id)} variant="success" style={{ flex: 1 }}>✅ Approve Leave</Button>
                <Button onClick={() => handleRejectClick(selectedLeave._id)} variant="danger" style={{ flex: 1 }}>❌ Reject Leave</Button>
              </div>
            )}
          </LeaveLetterModal>
        )}

        {rejectModal.open && (
          <div className="fixed inset-0 flex items-center justify-center z-[60] p-4" style={{ background: theme.colors.overlay }}>
            <div style={{ background: theme.colors.surface, borderRadius: theme.radius.md, boxShadow: theme.shadow.lg }} className="p-6 max-w-md w-full">
              <h3 style={{ color: theme.colors.text }} className="text-lg font-bold mb-4">Reject Leave Application</h3>
              <textarea value={rejectModal.reason} onChange={(e) => setRejectModal(prev => ({ ...prev, reason: e.target.value }))}
                style={{ width: '100%', border: `1px solid ${theme.colors.border}`, borderRadius: theme.radius.sm, padding: '12px', color: theme.colors.text, outline: 'none' }} rows="3" placeholder="Enter rejection reason..."
              ></textarea>
              <div className="flex justify-end gap-3 mt-6">
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