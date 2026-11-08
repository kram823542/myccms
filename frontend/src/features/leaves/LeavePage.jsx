import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/ui/Loader';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import LeaveForm from './LeaveForm';
import LeaveLetterModal from './LeaveLetterModal';
import { applyLeaveApi, getMyLeavesApi, cancelLeaveApi } from './leaves.api';
import { getAuthUser } from '../../utils/authStorage.js';
import { getEmployee } from '../employees/employees.api.js'; //  Employee API import kiya
import { theme } from '../../config/theme.js';

export default function LeavePage() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [selectedLeave, setSelectedLeave] = useState(null);

  const fetchLeaves = async () => {
    try {
      setFetching(true);
      const user = getAuthUser() || {};
      
      //  1. Employee ka CLF ID nikaalne ki koshish karo
      let fallbackClfId = user.clfId;
      let empId = user.employeeId;

      // Agar User session me clfId nahi hai, toh Employee API se fetch karo
      if (!fallbackClfId && empId) {
        try {
          const empRes = await getEmployee(empId);
          const empData = empRes.data?.data;
          fallbackClfId = empData?.clfId?._id || empData?.clfId;
        } catch (e) {
          console.error("Employee data fetch failed for CLF ID", e);
        }
      }

      const res = await getMyLeavesApi();
      
      //  2. Har leave me clfId inject kar do taaki modal me 'CLF Name Not Found' na aaye
      const mappedLeaves = (res.data || []).map(l => ({
        ...l,
        clfId: l.clfId || l.employeeId?.clfId || fallbackClfId
      }));

      setLeaves(mappedLeaves);
    } catch  {
      toast.error('Failed to load leave history');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => { void Promise.resolve().then(fetchLeaves); }, []);

  const handleApplyLeave = async (payload, onSuccess) => {
    setLoading(true);
    try {
      await applyLeaveApi(payload);
      toast.success('Leave applied successfully!');
      onSuccess();
      fetchLeaves();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply leave');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelLeave = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this leave?')) return;
    try {
      await cancelLeaveApi(id);
      toast.success('Leave cancelled');
      fetchLeaves();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel leave');
    }
  };

  return (
    <div style={{ background: theme.colors.background, minHeight: '100vh', padding: '16px' }} className="sm:p-6">
      <div className="max-w-6xl mx-auto">
        <PageHeader title="Leave Management" subtitle="Apply for leaves and view your history" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          
          {/*  Left Column: Form */}
          <div className="lg:col-span-1">
            <LeaveForm onSubmit={handleApplyLeave} loading={loading} />
          </div>

          {/*  Right Column: History */}
          <div style={{ background: theme.colors.surface, padding: 'clamp(16px, 4vw, 24px)', borderRadius: theme.radius.md, boxShadow: theme.shadow.sm, border: `1px solid ${theme.colors.border}` }} className="lg:col-span-2">
            <h2 style={{ color: theme.colors.text, borderBottom: `1px solid ${theme.colors.border}`, paddingBottom: '12px', marginBottom: '16px' }} className="text-base md:text-lg font-semibold">My Leave History</h2>
            
            {fetching ? (
              <div className="py-10 flex justify-center"><Loader /></div>
            ) : leaves.length === 0 ? (
              <div style={{ color: theme.colors.muted, borderColor: theme.colors.border }} className="text-center py-10 rounded-lg border border-dashed text-sm">
                You have not applied for any leaves yet.
              </div>
            ) : (
              <>
                {/*  Desktop Table (Hidden on Mobile) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr style={{ background: theme.colors.background, color: theme.colors.muted, borderTop: `1px solid ${theme.colors.border}`, borderBottom: `1px solid ${theme.colors.border}` }} className="text-sm">
                        <th className="p-3 font-medium">Type</th>
                        <th className="p-3 font-medium">Dates</th>
                        <th className="p-3 font-medium">Days</th>
                        <th className="p-3 font-medium">Status</th>
                        <th className="p-3 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody style={{ color: theme.colors.text }} className="text-sm">
                      {leaves.map((leave) => (
                        <tr key={leave._id} style={{ borderBottom: `1px solid ${theme.colors.border}`, '--theme-hover-color': theme.colors.overlaySubtle }} className="theme-hover-row transition">
                          <td className="p-3 font-medium">{leave.leaveType}</td>
                          <td style={{ color: theme.colors.muted }} className="p-3">
                            {new Date(leave.startDate).toLocaleDateString('en-IN')} {leave.startDate !== leave.endDate && ` - ${new Date(leave.endDate).toLocaleDateString('en-IN')}`}
                          </td>
                          <td style={{ color: theme.colors.muted }} className="p-3">{leave.totalDays}</td>
                          <td className="p-3"><Badge variant={leave.status === 'APPROVED' ? 'success' : leave.status === 'REJECTED' ? 'danger' : 'warning'}>{leave.status}</Badge></td>
                          <td className="p-3 flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => setSelectedLeave(leave)}>View Letter</Button>
                            {leave.status === 'PENDING' && <Button size="sm" variant="danger" onClick={() => handleCancelLeave(leave._id)}>Cancel</Button>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/*  Mobile Card View (Hidden on Desktop) */}
                <div className="md:hidden flex flex-col gap-3">
                  {leaves.map((leave) => (
                    <div key={leave._id} style={{ border: `1px solid ${theme.colors.border}`, borderRadius: theme.radius.md, padding: '12px', backgroundColor: theme.colors.background }}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold text-sm" style={{ color: theme.colors.text }}>{leave.leaveType}</div>
                        <Badge variant={leave.status === 'APPROVED' ? 'success' : leave.status === 'REJECTED' ? 'danger' : 'warning'}>{leave.status}</Badge>
                      </div>
                      
                      <div className="text-xs space-y-1 mb-3" style={{ color: theme.colors.muted }}>
                        <p><strong>Dates:</strong> {new Date(leave.startDate).toLocaleDateString('en-IN')} {leave.startDate !== leave.endDate && ` - ${new Date(leave.endDate).toLocaleDateString('en-IN')}`}</p>
                        <p><strong>Days:</strong> {leave.totalDays}</p>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" style={{ flex: 1 }} onClick={() => setSelectedLeave(leave)}>View Letter</Button>
                        {leave.status === 'PENDING' && <Button size="sm" variant="danger" style={{ flex: 1 }} onClick={() => handleCancelLeave(leave._id)}>Cancel</Button>}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Modal me ab har haal me sahi clfId jayega */}
        {selectedLeave && <LeaveLetterModal leave={selectedLeave} onClose={() => setSelectedLeave(null)} />}
      </div>
    </div>
  );
}