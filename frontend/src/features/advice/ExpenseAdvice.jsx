// import { useEffect, useState } from 'react';
// import Modal from '../../components/ui/Modal.jsx';
// import Button from '../../components/ui/Button.jsx';
// import Input from '../../components/ui/Input.jsx';
// import Select from '../../components/ui/Select.jsx'; // ✅ NAYA
// import Loader from '../../components/ui/Loader.jsx';
// import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
// import * as adviceApi from './advice.api.js';
// import { getClf } from '../clfs/clfs.api.js'; // ✅ NAYA
// import toast from 'react-hot-toast';
// import { theme } from '../../config/theme.js';

// const EMPTY_ROW = { vendorName: '', bankName: '', branch: '', bankAccountNumber: '', ifscCode: '', reason: '', amount: '' };

// export default function ExpenseAdvice() {
//   const [showForm, setShowForm] = useState(false);
//   const [entries, setEntries] = useState([{ ...EMPTY_ROW }]);
//   const [adviceDate, setAdviceDate] = useState(new Date().toISOString().split('T')[0]);
//   const [adviceNumber, setAdviceNumber] = useState('');
  
//   // ✅ NAYA: CLF Data aur Selected Bank Account
//   const [clfData, setClfData] = useState(null);
//   const [selectedBankAcc, setSelectedBankAcc] = useState('');

//   const [advices, setAdvices] = useState([]);
//   const [saving, setSaving] = useState(false);
//   const [showHistory, setShowHistory] = useState(false);
//   const [loadingAdvices, setLoadingAdvices] = useState(false);
//   const [deleteTarget, setDeleteTarget] = useState(null);
//   const [deleting, setDeleting] = useState(false);

//   // ✅ CLF Data load karo
//   useEffect(() => {
//     const user = JSON.parse(localStorage.getItem('user') || '{}');
//     if (user.clfId) {
//       getClf(user.clfId).then(({ data }) => {
//         setClfData(data.data);
//         if (data.data?.bankAccounts?.length > 0) {
//           setSelectedBankAcc(data.data.bankAccounts[0].accountNumber);
//         }
//       }).catch(console.error);
//     }
//   }, []);

//   const loadAdvices = async () => {
//     setLoadingAdvices(true);
//     try {
//       const { data } = await adviceApi.listAdvices({ adviceType: 'EXPENSE', limit: 50 });
//       const list = data?.data?.advices || data?.advices || [];
//       setAdvices(list);
//     } catch (err) {
//       console.error('Load advices error:', err);
//       toast.error('Failed to load expense history. Please try again.');
//       setAdvices([]); 
//     } finally {
//       setLoadingAdvices(false);
//     }
//   };

//   useEffect(() => { loadAdvices(); }, []);

//   const handleOpenForm = () => {
//     setEntries([{ ...EMPTY_ROW }]);
//     setAdviceNumber('');
//     setAdviceDate(new Date().toISOString().split('T')[0]);
//     setShowForm(true);
//   };

//   const handleAddRow = () => setEntries([...entries, { ...EMPTY_ROW }]);

//   const handleRemoveRow = (idx) => {
//     if (entries.length === 1) return toast.error('At least one entry required');
//     setEntries(entries.filter((_, i) => i !== idx));
//   };

//   const handleChange = (idx, field, value) => {
//     setEntries((prev) => prev.map((e, i) => (i === idx ? { ...e, [field]: value } : e)));
//   };

//   const handleSaveAdvice = async () => {
//     for (let i = 0; i < entries.length; i++) {
//       const e = entries[i];
//       if (!e.vendorName.trim()) return toast.error(`Enter shop name for entry ${i + 1}`);
//       if (!e.bankName.trim()) return toast.error(`Enter bank for ${e.vendorName}`);
//       if (!e.bankAccountNumber.trim()) return toast.error(`Enter account for ${e.vendorName}`);
//       if (!e.reason.trim()) return toast.error(`Enter reason for ${e.vendorName}`);
//       if (!e.amount || parseFloat(e.amount) <= 0) return toast.error(`Enter valid amount for ${e.vendorName}`);
//     }

//     // ✅ NAYA: Bank Account validation
//     if (!selectedBankAcc) return toast.error('Please select a CLF Bank Account');
//     const selectedBankObj = clfData?.bankAccounts?.find(b => b.accountNumber === selectedBankAcc);
//     if (!selectedBankObj) return toast.error('Invalid Bank Account selected');

//     const payload = {
//       adviceType: 'EXPENSE',
//       adviceDate,
//       ...(adviceNumber.trim() && { adviceNumber: adviceNumber.trim() }),
//       clfBankDetails: selectedBankObj, // ✅ NEW: Selected Bank Detail
//       bankName: selectedBankObj.bankName, // fallback
//       branch: selectedBankObj.branch, // fallback
//       employees: entries.map((e) => ({
//         name: e.vendorName.trim(),
//         month: e.reason.trim(),
//         bankName: e.bankName.trim(),
//         bankAccountNumber: e.bankAccountNumber.trim(),
//         branch: e.branch.trim(),
//         ifscCode: e.ifscCode.trim().toUpperCase(),
//         amount: parseFloat(e.amount),
//       })),
//     };

//     setSaving(true);
//     try {
//       const { data } = await adviceApi.createAdvice(payload);
//       const saved = data.data;
//       toast.success(`✅ Advice saved — ${saved.adviceNumber || '(auto)'}`);
//       await downloadPDFFor(saved._id, saved.adviceNumber);
//       setShowForm(false);
//       setEntries([{ ...EMPTY_ROW }]);
//       setAdviceNumber('');
//       loadAdvices();
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Failed to save');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const downloadPDFFor = async (id, adviceNumber) => {
//     try {
//       const { data } = await adviceApi.downloadAdvicePDF(id);
//       const blob = new Blob([data], { type: 'application/pdf' });
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       const safeNumber = adviceNumber && adviceNumber.trim() ? adviceNumber.replace(/\//g, '-') : `ADV-${id}`;
//       a.download = `Advice-${safeNumber}.pdf`;
//       document.body.appendChild(a);
//       a.click();
//       document.body.removeChild(a);
//       URL.revokeObjectURL(url);
//     } catch (err) {
//       toast.error('Failed to download PDF');
//     }
//   };

//   const handleDelete = async () => {
//     if (!deleteTarget) return;
//     setDeleting(true);
//     try {
//       await adviceApi.deleteAdvice(deleteTarget._id);
//       toast.success('Advice deleted');
//       setDeleteTarget(null);
//       loadAdvices();
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Failed');
//     } finally {
//       setDeleting(false);
//     }
//   };

//   const total = entries.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);

//   return (
//     <div className="space-y-4">
//       <div className="p-3 border flex items-center justify-between" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radius.md }}>
//         <div>
//           <h2 className="text-[10px] font-bold tracking-widest uppercase" style={{ color: theme.colors.muted }}>Company Expense Advice</h2>
//           <p className="text-xs mt-0.5" style={{ color: theme.colors.muted }}>Dukaan / Hotel / Vendor का bank advice generate करें।</p>
//         </div>
//         <button onClick={() => { setShowHistory((v) => !v); if (!showHistory) loadAdvices(); }} className="text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded" style={{ border: `1px solid ${theme.colors.border}`, color: theme.colors.primary, backgroundColor: theme.colors.background }}>
//           {showHistory ? '✕ Close History' : `📚 History (${advices.length})`}
//         </button>
//       </div>

//       {showHistory && (
//         <div className="border overflow-hidden" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radius.md }}>
//           <div className="px-4 py-3 border-b" style={{ borderColor: theme.colors.border }}>
//             <h3 className="text-[10px] font-bold tracking-widest uppercase" style={{ color: theme.colors.muted }}>Saved Expense Advices</h3>
//           </div>
//           {loadingAdvices ? (
//             <div className="py-12 flex justify-center"><Loader /></div>
//           ) : advices.length === 0 ? (
//             <div className="py-10 text-center text-xs" style={{ color: theme.colors.muted }}>No advices yet.</div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full text-left border-collapse">
//                 <thead>
//                   <tr className="text-[10px] font-bold uppercase tracking-widest border-b" style={{ borderColor: theme.colors.border, color: theme.colors.muted }}>
//                     <th className="px-4 py-2">Advice No.</th>
//                     <th className="px-4 py-2">Date</th>
//                     <th className="px-4 py-2">Bank</th>
//                     <th className="px-4 py-2 text-right">Rows</th>
//                     <th className="px-4 py-2 text-right">Total ₹</th>
//                     <th className="px-4 py-2 text-center">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {advices.map((a) => (
//                     <tr key={a._id} className="border-b text-xs" style={{ borderColor: theme.colors.border }}>
//                       <td className="px-4 py-2 font-mono font-semibold" style={{ color: theme.colors.text }}>
//                         {(() => {
//                           const prefix = `SAT/CLF/${new Date(a.adviceDate).getFullYear()}/`;
//                           if (a.adviceNumber && a.adviceNumber.trim()) return a.adviceNumber.startsWith('SAT/') ? a.adviceNumber : prefix + a.adviceNumber.split('/').pop();
//                           return prefix + '...';
//                         })()}
//                       </td>
//                       <td className="px-4 py-2" style={{ color: theme.colors.muted }}>{new Date(a.adviceDate).toLocaleDateString('en-IN')}</td>
//                       <td className="px-4 py-2" style={{ color: theme.colors.text }}>{a.bankName || '-'}</td>
//                       <td className="px-4 py-2 text-right font-mono" style={{ color: theme.colors.text }}>{a.totalRows}</td>
//                       <td className="px-4 py-2 text-right font-mono font-bold" style={{ color: theme.colors.secondary }}>₹ {a.totalAmount.toLocaleString('en-IN')}</td>
//                       <td className="px-4 py-2 text-center">
//                         <div className="flex justify-center gap-2">
//                           <Button size="sm" variant="outline" onClick={() => downloadPDFFor(a._id, a.adviceNumber)}>⬇️ PDF</Button>
//                           <Button size="sm" variant="danger" onClick={() => setDeleteTarget(a)}>🗑️</Button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       )}

//       <div className="flex justify-center">
//         <Button onClick={handleOpenForm} style={{ padding: '12px 24px', borderRadius: theme.radius.sm }}>+ Add New Expense Advice</Button>
//       </div>

//       <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Add Expense Entries" size="xl">
//         <div className="space-y-5">
          
//           {/* ✅ NAYA: CLF Bank Account Select */}
//           <div style={{ padding: 12, background: theme.colors.background, borderRadius: theme.radius.sm, border: `1px solid ${theme.colors.border}` }}>
//             <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: theme.colors.primary, marginBottom: 8 }}>
//               Select CLF Bank Account *
//             </label>
//             <Select
//               value={selectedBankAcc}
//               onChange={(e) => setSelectedBankAcc(e.target.value)}
//               options={(clfData?.bankAccounts || []).map(b => ({ 
//                 value: b.accountNumber, 
//                 label: `${b.accountName} - ${b.bankName} (A/c: ${b.accountNumber})` 
//               }))}
//               placeholder="Select Bank Account"
//             />
//             {(!clfData?.bankAccounts || clfData.bankAccounts.length === 0) && (
//               <p style={{ fontSize: 11, color: theme.colors.danger, marginTop: 4 }}>
//                 ⚠️ No bank accounts found. Please add them in your Profile first.
//               </p>
//             )}
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//             <Input label="Advice Number (Optional)" value={adviceNumber} onChange={(e) => setAdviceNumber(e.target.value)} placeholder="e.g. SAT/CLF/2026/001" style={{ fontFamily: 'monospace' }} maxLength={60} />
//             <Input label="Advice Date" type="date" value={adviceDate} onChange={(e) => setAdviceDate(e.target.value)} />
//           </div>

//           <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
//             {entries.map((entry, idx) => (
//               <div key={idx} className="border p-3" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radius.sm }}>
//                 <div className="flex items-center justify-between mb-3 pb-2 border-b" style={{ borderColor: theme.colors.border }}>
//                   <div className="flex items-center gap-2">
//                     <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: theme.colors.background, color: theme.colors.primary, border: `1px solid ${theme.colors.border}` }}>{idx + 1}</span>
//                     <p className="text-sm font-bold" style={{ color: theme.colors.text }}>{entry.vendorName || `Entry #${idx + 1}`}</p>
//                   </div>
//                   {entries.length > 1 && <Button size="sm" variant="danger" onClick={() => handleRemoveRow(idx)}>Remove</Button>}
//                 </div>

//                 <div className="mb-3">
//                   <Input label="Dukaan / Hotel / Vendor Name *" value={entry.vendorName} onChange={(e) => handleChange(idx, 'vendorName', e.target.value)} placeholder="e.g. Sharma General Store" />
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
//                   <Input label="Bank Name *" value={entry.bankName} onChange={(e) => handleChange(idx, 'bankName', e.target.value)} placeholder="e.g. SBI" />
//                   <Input label="Account No *" value={entry.bankAccountNumber} onChange={(e) => handleChange(idx, 'bankAccountNumber', e.target.value)} placeholder="e.g. 1234567890" style={{ fontFamily: 'monospace' }} />
//                   <Input label="Branch *" value={entry.branch} onChange={(e) => handleChange(idx, 'branch', e.target.value)} placeholder="e.g. Satbarwa" />
//                   <Input label="IFSC *" value={entry.ifscCode} onChange={(e) => handleChange(idx, 'ifscCode', e.target.value.toUpperCase())} placeholder="e.g. SBIN0001234" style={{ fontFamily: 'monospace' }} />
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                   <Input label="Expense Reason *" value={entry.reason} onChange={(e) => handleChange(idx, 'reason', e.target.value)} placeholder="e.g. Travel / Food / Office" />
//                   <Input label="Amount (₹) *" type="number" value={entry.amount} onChange={(e) => handleChange(idx, 'amount', e.target.value)} placeholder="e.g. 5000" style={{ fontFamily: 'monospace' }} />
//                 </div>
//               </div>
//             ))}
//           </div>

//           <Button variant="ghost" onClick={handleAddRow} style={{ width: '100%', borderStyle: 'dashed' }}>+ Add Another Entry</Button>

//           <div className="border p-4 flex items-center justify-between" style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border, borderRadius: theme.radius.sm }}>
//             <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: theme.colors.muted }}>Total Amount</span>
//             <span className="text-lg font-bold font-mono" style={{ color: theme.colors.secondary }}>₹ {total.toLocaleString('en-IN')}</span>
//           </div>

//           <div className="flex gap-3 pt-3 border-t" style={{ borderColor: theme.colors.border }}>
//             <Button onClick={handleSaveAdvice} loading={saving} style={{ flex: 1 }}>💾 Save & Download PDF</Button>
//             <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
//           </div>
//         </div>
//       </Modal>

//       <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Advice?" message={`Are you sure you want to delete "${deleteTarget?.adviceNumber || 'this advice'}"?`} confirmText="Delete" loading={deleting} variant="danger" />
//     </div>
//   );
// }

import { useEffect, useState } from 'react';
import Modal from '../../components/ui/Modal.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Select from '../../components/ui/Select.jsx';
import Loader from '../../components/ui/Loader.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import * as adviceApi from './advice.api.js';
import { getClf } from '../clfs/clfs.api.js';
import toast from 'react-hot-toast';
import { theme } from '../../config/theme.js';

const EMPTY_ROW = { vendorName: '', bankName: '', branch: '', bankAccountNumber: '', ifscCode: '', reason: '', amount: '' };

export default function ExpenseAdvice() {
  const [showForm, setShowForm] = useState(false);
  const [entries, setEntries] = useState([{ ...EMPTY_ROW }]);
  const [adviceDate, setAdviceDate] = useState(new Date().toISOString().split('T')[0]);
  const [adviceNumber, setAdviceNumber] = useState('');
  
  // ✅ CLF Data aur Selected Bank Account
  const [clfData, setClfData] = useState(null);
  const [selectedBankAcc, setSelectedBankAcc] = useState('');

  const [advices, setAdvices] = useState([]);
  const [saving, setSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingAdvices, setLoadingAdvices] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ✅ CLF Data load karo
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.clfId) {
      getClf(user.clfId).then(({ data }) => {
        setClfData(data.data);
        if (data.data?.bankAccounts?.length > 0) {
          setSelectedBankAcc(data.data.bankAccounts[0].accountNumber);
        }
      }).catch(console.error);
    }
  }, []);

  const loadAdvices = async () => {
    setLoadingAdvices(true);
    try {
      const { data } = await adviceApi.listAdvices({ adviceType: 'EXPENSE', limit: 50 });
      const list = data?.data?.advices || data?.advices || [];
      setAdvices(list);
    } catch (err) {
      console.error('Load advices error:', err);
      toast.error('Failed to load expense history. Please try again.');
      setAdvices([]); 
    } finally {
      setLoadingAdvices(false);
    }
  };

  useEffect(() => { loadAdvices(); }, []);

  const handleOpenForm = () => {
    setEntries([{ ...EMPTY_ROW }]);
    setAdviceNumber('');
    setAdviceDate(new Date().toISOString().split('T')[0]);
    setShowForm(true);
  };

  const handleAddRow = () => setEntries([...entries, { ...EMPTY_ROW }]);

  const handleRemoveRow = (idx) => {
    if (entries.length === 1) return toast.error('At least one entry required');
    setEntries(entries.filter((_, i) => i !== idx));
  };

  const handleChange = (idx, field, value) => {
    setEntries((prev) => prev.map((e, i) => (i === idx ? { ...e, [field]: value } : e)));
  };

  const handleSaveAdvice = async () => {
    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
      if (!e.vendorName.trim()) return toast.error(`Enter shop name for entry ${i + 1}`);
      if (!e.bankName.trim()) return toast.error(`Enter bank for ${e.vendorName}`);
      if (!e.bankAccountNumber.trim()) return toast.error(`Enter account for ${e.vendorName}`);
      if (!e.reason.trim()) return toast.error(`Enter reason for ${e.vendorName}`);
      if (!e.amount || parseFloat(e.amount) <= 0) return toast.error(`Enter valid amount for ${e.vendorName}`);
    }

    // ✅ Bank Account validation
    if (!selectedBankAcc) return toast.error('Please select a CLF Bank Account');
    const selectedBankObj = clfData?.bankAccounts?.find(b => b.accountNumber === selectedBankAcc);
    if (!selectedBankObj) return toast.error('Invalid Bank Account selected');

    const payload = {
      adviceType: 'EXPENSE',
      adviceDate,
      ...(adviceNumber.trim() && { adviceNumber: adviceNumber.trim() }),
      clfBankDetails: selectedBankObj, // ✅ Selected Bank Detail
      bankName: selectedBankObj.bankName, // fallback
      branch: selectedBankObj.branch, // fallback
      employees: entries.map((e) => ({
        name: e.vendorName.trim(),
        month: e.reason.trim(), // ✅ Expense me Reason ko Month column me bhej rahe hain taaki PDF me dikhe
        bankName: e.bankName.trim(),
        bankAccountNumber: e.bankAccountNumber.trim(),
        branch: e.branch.trim(),
        ifscCode: e.ifscCode.trim().toUpperCase(),
        amount: parseFloat(e.amount),
      })),
    };

    setSaving(true);
    try {
      const { data } = await adviceApi.createAdvice(payload);
      const saved = data.data;
      toast.success(`✅ Advice saved — ${saved.adviceNumber || '(auto)'}`);
      await downloadPDFFor(saved._id, saved.adviceNumber);
      setShowForm(false);
      setEntries([{ ...EMPTY_ROW }]);
      setAdviceNumber('');
      loadAdvices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const downloadPDFFor = async (id, adviceNumber) => {
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
    } catch (err) {
      toast.error('Failed to download PDF');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adviceApi.deleteAdvice(deleteTarget._id);
      toast.success('Advice deleted');
      setDeleteTarget(null);
      loadAdvices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setDeleting(false);
    }
  };

  const total = entries.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);

  return (
    <div className="space-y-4">
      <div className="p-3 border flex items-center justify-between" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radius.md }}>
        <div>
          <h2 className="text-[10px] font-bold tracking-widest uppercase" style={{ color: theme.colors.muted }}>Company Expense Advice</h2>
          <p className="text-xs mt-0.5" style={{ color: theme.colors.muted }}>Dukaan / Hotel / Vendor का bank advice generate करें।</p>
        </div>
        <button onClick={() => { setShowHistory((v) => !v); if (!showHistory) loadAdvices(); }} className="text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded" style={{ border: `1px solid ${theme.colors.border}`, color: theme.colors.primary, backgroundColor: theme.colors.background }}>
          {showHistory ? '✕ Close History' : `📚 History (${advices.length})`}
        </button>
      </div>

      {showHistory && (
        <div className="border overflow-hidden" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radius.md }}>
          <div className="px-4 py-3 border-b" style={{ borderColor: theme.colors.border }}>
            <h3 className="text-[10px] font-bold tracking-widest uppercase" style={{ color: theme.colors.muted }}>Saved Expense Advices</h3>
          </div>
          {loadingAdvices ? (
            <div className="py-12 flex justify-center"><Loader /></div>
          ) : advices.length === 0 ? (
            <div className="py-10 text-center text-xs" style={{ color: theme.colors.muted }}>No advices yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] font-bold uppercase tracking-widest border-b" style={{ borderColor: theme.colors.border, color: theme.colors.muted }}>
                    <th className="px-4 py-2">Advice No.</th>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Bank</th>
                    <th className="px-4 py-2 text-right">Rows</th>
                    <th className="px-4 py-2 text-right">Total ₹</th>
                    <th className="px-4 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {advices.map((a) => (
                    <tr key={a._id} className="border-b text-xs" style={{ borderColor: theme.colors.border }}>
                      <td className="px-4 py-2 font-mono font-semibold" style={{ color: theme.colors.text }}>
                        {(() => {
                          const prefix = `SAT/CLF/${new Date(a.adviceDate).getFullYear()}/`;
                          if (a.adviceNumber && a.adviceNumber.trim()) return a.adviceNumber.startsWith('SAT/') ? a.adviceNumber : prefix + a.adviceNumber.split('/').pop();
                          return prefix + '...';
                        })()}
                      </td>
                      <td className="px-4 py-2" style={{ color: theme.colors.muted }}>{new Date(a.adviceDate).toLocaleDateString('en-IN')}</td>
                      <td className="px-4 py-2" style={{ color: theme.colors.text }}>{a.bankName || '-'}</td>
                      <td className="px-4 py-2 text-right font-mono" style={{ color: theme.colors.text }}>{a.totalRows}</td>
                      <td className="px-4 py-2 text-right font-mono font-bold" style={{ color: theme.colors.secondary }}>₹ {a.totalAmount.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-2 text-center">
                        <div className="flex justify-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => downloadPDFFor(a._id, a.adviceNumber)}>⬇️ PDF</Button>
                          <Button size="sm" variant="danger" onClick={() => setDeleteTarget(a)}>🗑️</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-center">
        <Button onClick={handleOpenForm} style={{ padding: '12px 24px', borderRadius: theme.radius.sm }}>+ Add New Expense Advice</Button>
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Add Expense Entries" size="xl">
        <div className="space-y-5">
          
          {/* ✅ CLF Bank Account Select */}
          <div style={{ padding: 12, background: theme.colors.background, borderRadius: theme.radius.sm, border: `1px solid ${theme.colors.border}` }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: theme.colors.primary, marginBottom: 8 }}>
              Select CLF Bank Account *
            </label>
            <Select
              value={selectedBankAcc}
              onChange={(e) => setSelectedBankAcc(e.target.value)}
              options={(clfData?.bankAccounts || []).map(b => ({ 
                value: b.accountNumber, 
                label: `${b.accountName} - ${b.bankName} (A/c: ${b.accountNumber})` 
              }))}
              placeholder="Select Bank Account"
            />
            {(!clfData?.bankAccounts || clfData.bankAccounts.length === 0) && (
              <p style={{ fontSize: 11, color: theme.colors.danger, marginTop: 4 }}>
                ⚠️ No bank accounts found. Please add them in your Profile first.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input label="Advice Number (Optional)" value={adviceNumber} onChange={(e) => setAdviceNumber(e.target.value)} placeholder="e.g. SAT/CLF/2026/001" style={{ fontFamily: 'monospace' }} maxLength={60} />
            <Input label="Advice Date" type="date" value={adviceDate} onChange={(e) => setAdviceDate(e.target.value)} />
          </div>

          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {entries.map((entry, idx) => (
              <div key={idx} className="border p-3" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radius.sm }}>
                <div className="flex items-center justify-between mb-3 pb-2 border-b" style={{ borderColor: theme.colors.border }}>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: theme.colors.background, color: theme.colors.primary, border: `1px solid ${theme.colors.border}` }}>{idx + 1}</span>
                    <p className="text-sm font-bold" style={{ color: theme.colors.text }}>{entry.vendorName || `Entry #${idx + 1}`}</p>
                  </div>
                  {entries.length > 1 && <Button size="sm" variant="danger" onClick={() => handleRemoveRow(idx)}>Remove</Button>}
                </div>

                <div className="mb-3">
                  <Input label="Dukaan / Hotel / Vendor Name *" value={entry.vendorName} onChange={(e) => handleChange(idx, 'vendorName', e.target.value)} placeholder="e.g. Sharma General Store" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                  <Input label="Bank Name *" value={entry.bankName} onChange={(e) => handleChange(idx, 'bankName', e.target.value)} placeholder="e.g. SBI" />
                  <Input label="Account No *" value={entry.bankAccountNumber} onChange={(e) => handleChange(idx, 'bankAccountNumber', e.target.value)} placeholder="e.g. 1234567890" style={{ fontFamily: 'monospace' }} />
                  <Input label="Branch *" value={entry.branch} onChange={(e) => handleChange(idx, 'branch', e.target.value)} placeholder="e.g. Satbarwa" />
                  <Input label="IFSC *" value={entry.ifscCode} onChange={(e) => handleChange(idx, 'ifscCode', e.target.value.toUpperCase())} placeholder="e.g. SBIN0001234" style={{ fontFamily: 'monospace' }} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input label="Expense Reason *" value={entry.reason} onChange={(e) => handleChange(idx, 'reason', e.target.value)} placeholder="e.g. Travel / Food / Office" />
                  <Input label="Amount (₹) *" type="number" value={entry.amount} onChange={(e) => handleChange(idx, 'amount', e.target.value)} placeholder="e.g. 5000" style={{ fontFamily: 'monospace' }} />
                </div>
              </div>
            ))}
          </div>

          <Button variant="ghost" onClick={handleAddRow} style={{ width: '100%', borderStyle: 'dashed' }}>+ Add Another Entry</Button>

          <div className="border p-4 flex items-center justify-between" style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border, borderRadius: theme.radius.sm }}>
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: theme.colors.muted }}>Total Amount</span>
            <span className="text-lg font-bold font-mono" style={{ color: theme.colors.secondary }}>₹ {total.toLocaleString('en-IN')}</span>
          </div>

          <div className="flex gap-3 pt-3 border-t" style={{ borderColor: theme.colors.border }}>
            <Button onClick={handleSaveAdvice} loading={saving} style={{ flex: 1 }}>💾 Save & Download PDF</Button>
            <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Advice?" message={`Are you sure you want to delete "${deleteTarget?.adviceNumber || 'this advice'}"?`} confirmText="Delete" loading={deleting} variant="danger" />
    </div>
  );
}