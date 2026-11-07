import { useEffect, useMemo, useState } from 'react';
import Modal from '../../components/ui/Modal.jsx';
import Loader from '../../components/ui/Loader.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Select from '../../components/ui/Select.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import { listEmployees } from '../employees/employees.api.js';
import { getClf } from '../clfs/clfs.api.js';
import { getAuthUser } from '../../utils/authStorage.js';
import * as adviceApi from './advice.api.js';
import toast from 'react-hot-toast';
import { theme } from '../../config/theme.js';

const MONTH_OPTIONS = [
  'Jan26', 'Feb26', 'Mar26', 'Apr26', 'May26', 'Jun26',
  'Jul26', 'Aug26', 'Sep26', 'Oct26', 'Nov26', 'Dec26'
];

export default function SalaryAdvice() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const [bankFilter, setBankFilter] = useState('');
  const [designationFilter, setDesignationFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  const [showEntryModal, setShowEntryModal] = useState(false);
  const [salaryEntries, setSalaryEntries] = useState([]);
  const [adviceDate, setAdviceDate] = useState(new Date().toISOString().split('T')[0]);
  const [adviceNumber, setAdviceNumber] = useState('');
  
  const [clfData, setClfData] = useState(null);
  const [selectedBankAcc, setSelectedBankAcc] = useState('');

  const [advices, setAdvices] = useState([]);
  const [saving, setSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [loadingAdvices, setLoadingAdvices] = useState(false);

  // ✅ CLF Data load karo & Advice Number auto-generate karo
   useEffect(() => {
    const user = getAuthUser() || {};
    if (user.clfId) {
      getClf(user.clfId).then(({ data }) => {
        setClfData(data.data);
        if (data.data?.bankAccounts?.length > 0) {
          setSelectedBankAcc(data.data.bankAccounts[0].accountNumber);
        }
        
        // ✅ FIX: Hindi se English Transliteration for Patrank Prefix
        const clfName = data.data?.name || '';
        
        // Hindi aksharon ka English me map
        const hindiMap = {
          'क':'K','ख':'KH','ग':'G','घ':'GH','ङ':'N',
          'च':'C','छ':'CH','ज':'J','झ':'JH','ञ':'N',
          'ट':'T','ठ':'TH','ड':'D','ढ':'DH','ण':'N',
          'त':'T','थ':'TH','द':'D','ध':'DH','न':'N',
          'प':'P','फ':'F','ब':'B','भ':'BH','म':'M',
          'य':'Y','र':'R','ल':'L','व':'V','श':'SH',
          'ष':'SH','स':'S','ह':'H','ळ':'L','क्ष':'KSH','ज्ञ':'GY',
          // Matras (vowels)
          'अ':'A','आ':'AA','इ':'I','ई':'EE','उ':'U','ऊ':'OO','ए':'E','ऐ':'AI','ओ':'O','औ':'AU',
          'ा':'A','ि':'I','ी':'I','ु':'U','ू':'U','े':'E','ै':'AI','ो':'O','ौ':'AU','ं':'N','ः':'H','्':''
        };

        // Naam ko translate karo
        let translatedName = '';
        for (let i = 0; i < clfName.length; i++) {
          const char = clfName[i];
          if (hindiMap[char]) {
            translatedName += hindiMap[char];
          } else if (/[A-Za-z]/.test(char)) {
            translatedName += char.toUpperCase(); // English letters as it is
          }
        }

        // Agar translation ke baad 3 se kam letters hain, toh 'X' add karo
        const prefix = translatedName.length >= 3 
          ? translatedName.substring(0, 3).toUpperCase() 
          : translatedName.padEnd(3, 'X').toUpperCase();
          
        const currentYear = new Date().getFullYear();
        setAdviceNumber(`${prefix}/CLF/${currentYear}/`);
      }).catch(console.error);
    }
  }, []);








  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await listEmployees({ page: 1, limit: 500 });
        setEmployees(data?.data?.employees || []);
      } catch (err) {
        toast.error('Failed to load employees');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const loadAdvices = async () => {
    setLoadingAdvices(true);
    try {
      const { data } = await adviceApi.listAdvices({ adviceType: 'SALARY', limit: 50 });
      const list = data?.data?.advices || data?.advices || [];
      setAdvices(list);
    } catch (err) {
      console.error('Load advices error:', err);
      toast.error('Failed to load salary history. Please try again.');
      setAdvices([]);
    } finally {
      setLoadingAdvices(false);
    }
  };

  useEffect(() => { loadAdvices(); }, []);

  const handleLoadClfMembers = async () => {
    try {
      setLoadingMembers(true);
      const user = getAuthUser() || {};
      const clfId = user.clfId;
      if (!clfId) return toast.error('CLF ID not found.');
      const { data } = await adviceApi.getClfMembers(clfId);
      const formattedMembers = (data.data || []).map(m => ({
        ...m,
        bankDetails: {
          ...m.bankDetails,
          ifsc: m.bankDetails?.ifsc || '',
        }
      }));
      setEmployees((prev) => [...prev, ...formattedMembers]);
      toast.success('CLF Members loaded successfully!');
    } catch (error) {
      toast.error('Failed to load CLF members');
    } finally {
      setLoadingMembers(false);
    }
  };

  const filteredEmployees = useMemo(() => {
    let list = employees;
    if (bankFilter) list = list.filter((e) => e.bankDetails?.bankName === bankFilter);
    if (designationFilter) list = list.filter((e) => e.designation === designationFilter);
    return list;
  }, [employees, bankFilter, designationFilter]);

  const uniqueBanks = useMemo(() => [...new Set(employees.map((e) => e.bankDetails?.bankName).filter(Boolean))].sort(), [employees]);
  const uniqueDesignations = useMemo(() => [...new Set(employees.map((e) => e.designation).filter(Boolean))].sort(), [employees]);

  const eligibleFiltered = filteredEmployees.filter((e) => e.bankDetails?.accountNumber);
  const allSelected = eligibleFiltered.length > 0 && selectedIds.length === eligibleFiltered.length;

  const toggleSelect = (id) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    if (allSelected) setSelectedIds([]);
    else setSelectedIds(eligibleFiltered.map((e) => e._id));
  };

  const handleContinue = () => {
    if (selectedIds.length === 0) return toast.error('Please select at least one employee');
    const selectedEmps = employees.filter((e) => selectedIds.includes(e._id));
    setSalaryEntries(selectedEmps.map((emp) => ({ 
      employee: emp, 
      month: MONTH_OPTIONS[new Date().getMonth()],
      amount: '' 
    })));
    setShowEntryModal(true);
  };

  const handleEntryChange = (idx, field, value) => {
    setSalaryEntries((prev) => prev.map((e, i) => (i === idx ? { ...e, [field]: value } : e)));
  };

  const handleSaveAdvice = async () => {
    for (let i = 0; i < salaryEntries.length; i++) {
      const e = salaryEntries[i];
      if (!e.month || !e.month.trim()) return toast.error(`Enter month for ${e.employee.name}`);
      if (!e.amount || parseFloat(e.amount) <= 0) return toast.error(`Enter valid amount for ${e.employee.name}`);
    }

    if (!selectedBankAcc) return toast.error('Please select a CLF Bank Account');
    const selectedBankObj = clfData?.bankAccounts?.find(b => b.accountNumber === selectedBankAcc);
    if (!selectedBankObj) return toast.error('Invalid Bank Account selected');

    const payload = {
      adviceType: 'SALARY',
      adviceDate,
      adviceNumber: adviceNumber.trim(), // Isme prefix + last number hoga
      clfBankDetails: selectedBankObj,
      bankName: selectedBankObj.bankName,
      branch: selectedBankObj.branch,
      employees: salaryEntries.map((entry) => ({
        name: entry.employee.name,
        designation: entry.employee.designation || '',
        month: entry.month,
        bankName: entry.employee.bankDetails?.bankName || '',
        bankAccountNumber: entry.employee.bankDetails?.accountNumber || '',
        branch: entry.employee.bankDetails?.branch || '',
        ifscCode: entry.employee.bankDetails?.ifsc || '',
        amount: parseFloat(entry.amount),
      })),
    };

    setSaving(true);
    try {
      const { data } = await adviceApi.createAdvice(payload);
      const saved = data.data;
      
      // ✅ Toast message me पत्रांक show karo
      toast.success(
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>✅ Advice Generated!</div>
          <div style={{ fontSize: 12 }}>पत्रांक: {saved.adviceNumber}</div>
        </div>, 
        { duration: 4000 }
      );

      await downloadPDFFor(saved._id, saved.adviceNumber);
      setShowEntryModal(false);
      setSalaryEntries([]);
      setSelectedIds([]);
      loadAdvices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save advice');
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
      toast.error(err.response?.data?.message || 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const totalAmount = salaryEntries.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
  const user = getAuthUser() || {};

  return (
    <div className="space-y-4">
      <div className="p-3 border flex items-center justify-between flex-wrap gap-3" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radius.md }}>
        <div>
          <h2 className="text-[10px] font-bold tracking-widest uppercase" style={{ color: theme.colors.muted }}>Employee Salary Advice</h2>
          <p className="text-xs mt-0.5" style={{ color: theme.colors.muted }}>Select employees, enter month & amount — PDF auto download hogi.</p>
        </div>
        <div className="flex gap-2">
          {user.clfId && (
            <Button onClick={handleLoadClfMembers} loading={loadingMembers} style={{ padding: '8px 12px', fontSize: 11 }}>⚡ Load CLF Members</Button>
          )}
          <button onClick={() => { setShowHistory((v) => !v); if (!showHistory) loadAdvices(); }} className="text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded" style={{ border: `1px solid ${theme.colors.border}`, color: theme.colors.primary, backgroundColor: theme.colors.background }}>
            {showHistory ? '✕ Close History' : `📚 History (${advices.length})`}
          </button>
        </div>
      </div>

      {showHistory && (
        <div className="border overflow-hidden" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radius.md }}>
          <div className="px-4 py-3 border-b" style={{ borderColor: theme.colors.border }}>
            <h3 className="text-[10px] font-bold tracking-widest uppercase" style={{ color: theme.colors.muted }}>Saved Salary Advices</h3>
          </div>
          {loadingAdvices ? (
            <div className="py-12 flex justify-center"><Loader /></div>
          ) : advices.length === 0 ? (
            <div className="py-10 text-center text-xs" style={{ color: theme.colors.muted }}>No salary advices yet.</div>
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
                        {a.adviceNumber || '...'}
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

      <div className="p-4 border" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radius.md }}>
        <h2 className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: theme.colors.muted }}>Step 1 : Apply Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-4">
            <Select label="Bank" value={bankFilter} onChange={(e) => { setBankFilter(e.target.value); setSelectedIds([]); }} options={uniqueBanks.map(b => ({ value: b, label: b }))} placeholder="All Banks" />
          </div>
          <div className="md:col-span-4">
            <Select label="Designation" value={designationFilter} onChange={(e) => { setDesignationFilter(e.target.value); setSelectedIds([]); }} options={uniqueDesignations.map(d => ({ value: d, label: d }))} placeholder="All Designations" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: theme.colors.muted }}>Selected</label>
            <div className="border px-3 py-2 text-xs font-semibold flex items-center justify-between" style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border, borderRadius: theme.radius.sm, color: theme.colors.text }}>
              <span>Employees</span>
              <span className="font-mono font-bold text-[13px]" style={{ color: theme.colors.primary }}>{selectedIds.length} / {eligibleFiltered.length}</span>
            </div>
          </div>
          <div className="md:col-span-2">
            <Button onClick={handleContinue} disabled={selectedIds.length === 0} style={{ width: '100%' }}>Continue ({selectedIds.length})</Button>
          </div>
        </div>
      </div>

      <div className="border overflow-hidden" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radius.md }}>
        <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: theme.colors.border }}>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: theme.colors.muted }}>Step 2 : Select Employees</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: theme.colors.background, color: theme.colors.primary }}>{filteredEmployees.length}</span>
          </div>
          {eligibleFiltered.length > 0 && (
            <Button size="sm" variant="ghost" onClick={handleSelectAll}>{allSelected ? 'Deselect All' : 'Select All'}</Button>
          )}
        </div>

        {loading ? (
          <div className="py-16 flex justify-center"><Loader /></div>
        ) : filteredEmployees.length === 0 ? (
          <div className="text-center py-12 text-xs" style={{ color: theme.colors.muted }}>No employees found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-widest border-b" style={{ borderColor: theme.colors.border, color: theme.colors.muted }}>
                  <th className="px-4 py-3 w-10"><input type="checkbox" checked={allSelected} onChange={handleSelectAll} disabled={eligibleFiltered.length === 0} className="w-3.5 h-3.5 rounded cursor-pointer" /></th>
                  <th className="px-4 py-3">Photo</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">User ID</th>
                  <th className="px-4 py-3">Designation</th>
                  <th className="px-4 py-3">Bank Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => {
                  const eligible = emp.bankDetails?.accountNumber;
                  const checked = selectedIds.includes(emp._id);
                  const initial = emp.name ? emp.name.charAt(0).toUpperCase() : 'E';
                  return (
                    <tr key={emp._id} onClick={() => eligible && toggleSelect(emp._id)} style={{ borderColor: theme.colors.border, backgroundColor: checked ? `${theme.colors.secondary}15` : 'transparent', '--theme-hover-color': theme.colors.overlaySubtle }} className={`border-b text-xs ${eligible ? 'theme-hover-row cursor-pointer' : 'opacity-40 cursor-not-allowed'}`}>
                      <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={checked} onChange={() => toggleSelect(emp._id)} disabled={!eligible} className="w-3.5 h-3.5 rounded cursor-pointer" /></td>
                      <td className="px-4 py-3"><div className="w-7 h-7 rounded-full border flex items-center justify-center font-bold text-[11px]" style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.primary }}>{initial}</div></td>
                      <td className="px-4 py-3 font-semibold" style={{ color: theme.colors.text }}>{emp.name}</td>
                      <td className="px-4 py-3 font-mono text-[11px]" style={{ color: theme.colors.muted }}>{emp.employeeCode || 'CLF Member'}</td>
                      <td className="px-4 py-3"><span className="inline-block border px-2 py-0.5 rounded text-[10px]" style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.muted }}>{emp.designation || 'N/A'}</span></td>
                      <td className="px-4 py-3">{emp.bankDetails?.accountNumber ? (<div className="leading-tight">{emp.bankDetails.bankName && (<p className="font-bold uppercase text-[11px]" style={{ color: theme.colors.text }}>{emp.bankDetails.bankName}</p>)}<p className="text-[10px] font-mono" style={{ color: theme.colors.muted }}>{emp.bankDetails.accountNumber}</p></div>) : (<span className="italic text-[11px]" style={{ color: theme.colors.muted }}>No Bank</span>)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={showEntryModal} onClose={() => setShowEntryModal(false)} title={`Enter Month & Amount (${salaryEntries.length} Selected)`} size="lg">
        <div className="space-y-4">
          
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
            {/* ✅ Advice Number (Auto Prefix) - User can type the end number */}
            <Input 
              label="Advice Number (पत्रांक)" 
              value={adviceNumber} 
              onChange={(e) => setAdviceNumber(e.target.value)} 
              placeholder="e.g. KUN/CLF/2026/001" 
              style={{ fontFamily: 'monospace' }} 
              maxLength={60} 
            />
            <Input label="Advice Date" type="date" value={adviceDate} onChange={(e) => setAdviceDate(e.target.value)} />
          </div>
          <div className="border rounded-lg p-3 flex justify-end items-center" style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border }}>
            <div className="text-right"><span className="block text-[10px] font-bold uppercase tracking-widest" style={{ color: theme.colors.muted }}>Total</span><span className="text-base font-bold font-mono" style={{ color: theme.colors.secondary }}>₹ {totalAmount.toLocaleString('en-IN')}</span></div>
          </div>
          <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
            {salaryEntries.map((entry, idx) => (
              <div key={entry.employee._id} className="border rounded-lg p-3" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
                <p className="text-xs font-semibold mb-2" style={{ color: theme.colors.text }}>{idx + 1}. {entry.employee.name} <span className="text-[10px]" style={{ color: theme.colors.muted }}>({entry.employee.designation || 'N/A'})</span></p>
                <div className="grid grid-cols-2 gap-3">
                  <Input 
                    label="Month(s) * (e.g. Jun26, Jul26)" 
                    value={entry.month} 
                    onChange={(e) => handleEntryChange(idx, 'month', e.target.value)} 
                    placeholder="Jun26, Jul26" 
                  />
                  <Input label="Amount (₹) *" type="number" value={entry.amount} onChange={(e) => handleEntryChange(idx, 'amount', e.target.value)} style={{ fontFamily: 'monospace' }} />
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 pt-3 border-t" style={{ borderColor: theme.colors.border }}>
            <Button onClick={handleSaveAdvice} loading={saving} style={{ flex: 1 }}>💾 Save & Download PDF</Button>
            <Button variant="ghost" onClick={() => setShowEntryModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Advice?" message={`Are you sure you want to delete "${deleteTarget?.adviceNumber || 'this advice'}"? This cannot be undone.`} confirmText="Delete" loading={deleting} variant="danger" />
    </div>
  );
}