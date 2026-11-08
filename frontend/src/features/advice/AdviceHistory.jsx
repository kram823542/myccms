import { useCallback, useEffect, useState } from 'react';
import Loader from '../../components/ui/Loader.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import * as adviceApi from './advice.api.js';
import toast from 'react-hot-toast';
import { theme } from '../../config/theme.js';

export default function AdviceHistory() {
  const [advices, setAdvices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
  //  NAYA: View Details Modal States
  const [viewTarget, setViewTarget] = useState(null);
  const [fetchingDetails, setFetchingDetails] = useState(false);

  const load = useCallback(async () => {
    try {
      const params = { limit: 200 };
      if (filter) params.adviceType = filter;
      const { data } = await adviceApi.listAdvices(params);
      
      const list = data?.data?.advices || data?.advices || (Array.isArray(data?.data) ? data.data : []);
      setAdvices(list);
    } catch (err) {
      console.error('History load error:', err);
      toast.error('Failed to load history');
      setAdvices([]); 
    } finally {
      setLoading(false);
    }
  }, [filter]);
  
  useEffect(() => { void Promise.resolve().then(load); }, [load]);

  //  NAYA: Detail Fetch Function
  const handleViewDetails = async (id) => {
    setFetchingDetails(true);
    setViewTarget(null); // Puraane data ko clear karein
    try {
      const { data } = await adviceApi.getAdvice(id); // Backend se full data fetch karein
      setViewTarget(data.data); // Modal open karein data ke sath
    } catch  {
      toast.error('Failed to load advice details');
    } finally {
      setFetchingDetails(false);
    }
  };

  const handleDownload = async (id, adviceNumber) => {
    try {
      const { data } = await adviceApi.downloadAdvicePDF(id);
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeNumber = adviceNumber && adviceNumber.trim() ? adviceNumber.replace(/\//g, '-') : `ADV-${id}`;
      a.download = `Advice-${safeNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('PDF downloaded');
    } catch  {
      toast.error('Failed to download PDF');
    }
  };

  const handlePrint = async (id) => {
    try {
      const { data } = await adviceApi.getAdvicePDFForPrint(id);
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const win = window.open(url, '_blank');
      if (!win) return toast.error('Please allow popups to print');
      setTimeout(() => { try { win.print(); } catch  {} }, 900);
    } catch  {
      toast.error('Failed to open print view');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adviceApi.deleteAdvice(deleteTarget._id);
      toast.success('Advice deleted');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const salaryTotal = advices.filter((a) => a.adviceType === 'SALARY').reduce((s, a) => s + (a.totalAmount || 0), 0);
  const expenseTotal = advices.filter((a) => a.adviceType === 'EXPENSE').reduce((s, a) => s + (a.totalAmount || 0), 0);

  const getAdviceNo = (a) => {
    if (!a) return '';
    const prefix = `SAT/CLF/${new Date(a.adviceDate).getFullYear()}/`;
    if (a.adviceNumber && a.adviceNumber.trim()) {
      return a.adviceNumber.startsWith('SAT/') ? a.adviceNumber : prefix + a.adviceNumber.split('/').pop();
    }
    return prefix + '...';
  };

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="p-3 border flex items-center justify-between flex-wrap gap-3" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radius.md }}>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: theme.colors.muted }}>Filter:</span>
          {[{ key: '', label: 'All' }, { key: 'SALARY', label: 'Salary' }, { key: 'EXPENSE', label: 'Expense' }].map((f) => (
            <Button key={f.key} size="sm" variant={filter === f.key ? 'primary' : 'ghost'} onClick={() => setFilter(f.key)}>
              {f.label}
            </Button>
          ))}
        </div>
        <div className="flex gap-4 text-[11px]">
          <span style={{ color: theme.colors.muted }}>Total: <b style={{ color: theme.colors.text }}>{advices.length}</b></span>
          <span style={{ color: theme.colors.muted }}>Salary: <b style={{ color: theme.colors.primary }}>₹ {salaryTotal.toLocaleString('en-IN')}</b></span>
          <span style={{ color: theme.colors.muted }}>Expense: <b style={{ color: theme.colors.secondary }}>₹ {expenseTotal.toLocaleString('en-IN')}</b></span>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-16 flex justify-center"><Loader /></div>
      ) : advices.length === 0 ? (
        <div className="py-12 text-center text-xs border rounded" style={{ color: theme.colors.muted, borderColor: theme.colors.border }}>No advices found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {advices.map((a) => (
            <div key={a._id} className="flex flex-col rounded-xl border transition-all hover:-translate-y-1 hover:shadow-md" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
              
              {/* Card Header */}
              <div className="p-4 border-b flex justify-between items-start" style={{ borderColor: `${theme.colors.border}50` }}>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: theme.colors.muted }}>Advice</span>
                  <h3 className="text-sm font-extrabold font-mono" style={{ color: theme.colors.primary }}>{getAdviceNo(a)}</h3>
                </div>
                <Badge variant={a.adviceType === 'SALARY' ? 'info' : 'warning'}>{a.adviceType}</Badge>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 space-y-3">
                <div>
                  <p className="text-[10px] font-bold uppercase mb-1" style={{ color: theme.colors.muted }}>Bank</p>
                  <p className="text-sm font-semibold truncate" style={{ color: theme.colors.text }}>{a.clfBankDetails?.bankName || a.bankName || '-'}</p>
                  <p className="text-xs font-mono mt-0.5" style={{ color: theme.colors.muted }}>A/c: {a.clfBankDetails?.accountNumber || '-'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase mb-1" style={{ color: theme.colors.muted }}>Date & Rows</p>
                  <p className="text-xs font-medium" style={{ color: theme.colors.text }}>{new Date(a.adviceDate).toLocaleDateString('en-IN')} • {a.totalRows} Rows</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase mb-1" style={{ color: theme.colors.muted }}>Total Amount</p>
                  <p className="text-lg font-bold font-mono" style={{ color: theme.colors.secondary }}>₹ {a.totalAmount.toLocaleString('en-IN')}</p>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="px-4 py-3 rounded-b-xl border-t flex justify-between items-center" style={{ borderColor: `${theme.colors.border}50`, backgroundColor: theme.colors.background }}>
                {/*  FIXED: View Details function call */}
                <Button size="sm" variant="outline" onClick={() => handleViewDetails(a._id)} style={{ padding: '4px 12px', fontSize: 11 }}>
                  {fetchingDetails ? 'Loading...' : 'View Details'}
                </Button>
                <div className="flex gap-1">
                  <button onClick={() => handlePrint(a._id)} style={{ padding: 6, borderRadius: 6, background: 'transparent' }} title="Print"></button>
                  <button onClick={() => handleDownload(a._id, a.adviceNumber)} style={{ padding: 6, borderRadius: 6, background: 'transparent' }} title="Download"></button>
                  <button onClick={() => setDeleteTarget(a)} style={{ padding: 6, borderRadius: 6, background: 'transparent' }} title="Delete"></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/*  Modal for View Details */}
      <Modal open={!!viewTarget} onClose={() => setViewTarget(null)} title={`Advice Details — ${viewTarget?.adviceNumber || ''}`} size="lg">
        {viewTarget && (
          <div className="space-y-4">
            <div className="p-3 rounded-lg border" style={{ borderColor: theme.colors.border, backgroundColor: theme.colors.background }}>
              <h4 className="text-xs font-bold uppercase mb-2" style={{ color: theme.colors.primary }}>Bank Information</h4>
              <p className="text-sm font-semibold">{viewTarget.clfBankDetails?.bankName || viewTarget.bankName}</p>
              <p className="text-xs font-mono">A/c: {viewTarget.clfBankDetails?.accountNumber || '-'}</p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase mb-2" style={{ color: theme.colors.muted }}>Employees List ({viewTarget.employees?.length})</h4>
              <div className="overflow-x-auto border rounded-lg" style={{ borderColor: theme.colors.border }}>
                <table className="w-full text-left text-xs">
                  <thead style={{ backgroundColor: theme.colors.background }}>
                    <tr>
                      <th className="p-2">Name</th>
                      <th className="p-2">Designation</th>
                      <th className="p-2">A/c No.</th>
                      <th className="p-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewTarget.employees?.map((emp, i) => (
                      <tr key={i} className="border-t" style={{ borderColor: `${theme.colors.border}50` }}>
                        <td className="p-2 font-semibold">{emp.name}</td>
                        <td className="p-2" style={{ color: theme.colors.muted }}>{emp.designation || '-'}</td>
                        <td className="p-2 font-mono" style={{ color: theme.colors.muted }}>{emp.bankAccountNumber || '-'}</td>
                        <td className="p-2 text-right font-bold">₹ {emp.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Advice?" message={`Are you sure you want to delete "${deleteTarget?.adviceNumber || 'this advice'}"?`} confirmText="Delete" loading={deleting} variant="danger" />
    </div>
  );
}