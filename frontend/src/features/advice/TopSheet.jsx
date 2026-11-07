import { useEffect, useState } from 'react';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Select from '../../components/ui/Select.jsx';
import Loader from '../../components/ui/Loader.jsx';
import TopSheetHistory from './TopSheetHistory.jsx'; 
import TopSheetFormate from './TopSheetFormate.jsx'; // ✅ Import TopSheetFormate
import * as adviceApi from './advice.api.js';
import { getClf } from '../clfs/clfs.api.js';
import { getAuthUser } from '../../utils/authStorage.js';
import toast from 'react-hot-toast';
import { theme } from '../../config/theme.js';

export default function TopSheet() {
  const [activeTab, setActiveTab] = useState('generate');

  const [month, setMonth] = useState('');
  const [advices, setAdvices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  const [clfData, setClfData] = useState(null);
  const [selectedBankAcc, setSelectedBankAcc] = useState('');
  const [selectedAdviceIds, setSelectedAdviceIds] = useState([]);
  const [inputs, setInputs] = useState({});
  
  // ✅ NAYA: Top Sheet Preview ke liye state
  const [topSheetData, setTopSheetData] = useState(null);
  const [selectedBankObj, setSelectedBankObj] = useState(null);

  useEffect(() => {
    const user = getAuthUser() || {};
    if (user.clfId) {
      getClf(user.clfId).then(({ data }) => {
        setClfData(data.data);
        if (data.data?.bankAccounts?.length > 0) {
          setSelectedBankAcc(data.data.bankAccounts[0].accountNumber);
        }
      }).catch(console.error);
    }
    
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setMonth(currentMonth);
  }, []);

  const fetchAdvices = async () => {
    if (!month) return toast.error('Select month first');
    setLoading(true);
    setAdvices([]); 
    
    try {
      const startDate = `${month}-01`;
      const [year, selectedMonth] = month.split('-').map(Number);
      const lastDay = new Date(year, selectedMonth, 0).getDate();
      const endDate = `${month}-${String(lastDay).padStart(2, '0')}`;
      const list = [];
      let page = 1;
      let pages = 1;

      do {
        const { data } = await adviceApi.listAdvices({
          limit: 100,
          page,
          from: startDate,
          to: endDate,
        });
        const result = data?.data || data;
        list.push(...(result?.advices || []));
        pages = result?.pagination?.pages || 1;
        page += 1;
      } while (page <= pages);
      
      if (list.length === 0) {
        toast.error('Is month ke liye koi Advice nahi mili.');
        return;
      }

      const sortedList = [...list].sort((a, b) => new Date(b.adviceDate) - new Date(a.adviceDate));

      setAdvices(sortedList);
      setSelectedAdviceIds(sortedList.map(a => a._id));

      const initInputs = {};
      sortedList.forEach(a => { initInputs[a._id] = { chequeNumber: '', blockLetterNumber: '' }; });
      setInputs(initInputs);
      toast.success(`${sortedList.length} Advices fetched!`);

    } catch (err) {
      console.error("❌ Fetch Error:", err);
      toast.error(err.response?.data?.message || 'Failed to load advices');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (id, field, value) => {
    setInputs(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const toggleSelect = (id) => {
    setSelectedAdviceIds((prev) => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedAdviceIds.length === advices.length) {
      setSelectedAdviceIds([]);
    } else {
      setSelectedAdviceIds(advices.map(a => a._id));
    }
  };

  const handleGenerate = async () => {
    if (!advices.length) return toast.error('No advices found for this month');
    if (selectedAdviceIds.length === 0) return toast.error('Please select at least one advice');
    if (!selectedBankAcc) return toast.error('Please select a CLF Bank Account');

    const user = getAuthUser() || {};
    const clfId = user.clfId;
    if (!clfId) return toast.error('CLF ID not found');

    const bankObj = clfData?.bankAccounts?.find(b => b.accountNumber === selectedBankAcc);
    if (!bankObj) return toast.error('Invalid Bank Account selected');
    setSelectedBankObj(bankObj);

    const payload = {
      clfId,
      month,
      selectedBank: bankObj, 
      adviceDetails: selectedAdviceIds.map(id => ({
        adviceId: id,
        chequeNumber: inputs[id]?.chequeNumber || '',
        blockLetterNumber: inputs[id]?.blockLetterNumber || '',
      }))
    };

    setGenerating(true);
    try {
      // ✅ Yahan hum API se PDF mangwa rahe hain (jo backend se aayega)
      const { data } = await adviceApi.generateTopSheet(payload);
      
      // Agar aap frontend wala TopSheetFormate use karna chahte ho toh data ready karo
      const selectedAdvicesData = advices.filter(a => selectedAdviceIds.includes(a._id)).map(a => ({
        adviceId: a._id,
        designation: a.employees?.map(e => e.designation).join(', ') || 'N/A',
        month: a.employees?.[0]?.month || month,
        totalCader: a.totalRows,
        bankName: a.clfBankDetails?.bankName || a.bankName,
        totalAmount: a.totalAmount
      }));
      setTopSheetData(selectedAdvicesData);

      // Direct Backend PDF Download
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `TopSheet-${clfData?.name || 'CLF'}-${month}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Top Sheet Generated Successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate Top Sheet');
    } finally {
      setGenerating(false);
    }
  };

  const grandTotal = advices
    .filter(a => selectedAdviceIds.includes(a._id))
    .reduce((sum, a) => sum + a.totalAmount, 0);

  return (
    <div className="space-y-4">
      
      {/* Dynamic Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 border rounded-full w-max" style={{ background: theme.colors.background, borderColor: theme.colors.border, boxShadow: theme.shadow.sm }}>
        <Button
          onClick={() => setActiveTab('generate')}
          variant={activeTab === 'generate' ? 'primary' : 'ghost'}
          style={{
            borderRadius: 999, padding: '8px 20px', fontWeight: activeTab === 'generate' ? 700 : 500,
            boxShadow: activeTab === 'generate' ? theme.shadow.md : 'none', display: 'flex', alignItems: 'center', gap: 8
          }}
        >
          <span style={{ fontSize: 16, opacity: activeTab === 'generate' ? 1 : 0.7 }}>📄</span>
          Generate Top Sheet
        </Button>
        
        <Button
          onClick={() => setActiveTab('history')}
          variant={activeTab === 'history' ? 'primary' : 'ghost'}
          style={{
            borderRadius: 999, padding: '8px 20px', fontWeight: activeTab === 'history' ? 700 : 500,
            boxShadow: activeTab === 'history' ? theme.shadow.md : 'none', display: 'flex', alignItems: 'center', gap: 8
          }}
        >
          <span style={{ fontSize: 16, opacity: activeTab === 'history' ? 1 : 0.7 }}>📚</span>
          History
        </Button>
      </div>

      {activeTab === 'history' ? (
        <TopSheetHistory />
      ) : (
        <>
          {/* Top Sheet Generate Form */}
          <div className="p-4 border" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radius.md }}>
            <h2 className="text-sm font-bold uppercase mb-3" style={{ color: theme.colors.primary }}>Generate Monthly Top Sheet</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              <div className="md:col-span-4">
                <Input label="Select Month" type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
              </div>
              
              <div className="md:col-span-5">
                <Select
                  label="Select CLF Bank Account *"
                  value={selectedBankAcc}
                  onChange={(e) => setSelectedBankAcc(e.target.value)}
                  options={(clfData?.bankAccounts || []).map(b => ({ 
                    value: b.accountNumber, 
                    label: `${b.accountName} - ${b.bankName} (A/c: ${b.accountNumber})` 
                  }))}
                  placeholder="Select Bank Account"
                />
              </div>

              <div className="md:col-span-3">
                <Button onClick={fetchAdvices} loading={loading} style={{ width: '100%' }}>Fetch Advices</Button>
              </div>
            </div>
          </div>

          {/* List of Advices */}
          {loading ? (
            <div className="py-12 flex justify-center"><Loader /></div>
          ) : advices.length > 0 ? (
            <div className="border overflow-hidden" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radius.md }}>
              
              <div className="p-3 border-b flex flex-wrap justify-between items-center gap-3" style={{ borderColor: theme.colors.border, backgroundColor: theme.colors.background }}>
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={selectedAdviceIds.length === advices.length && advices.length > 0} onChange={handleSelectAll} className="w-4 h-4 cursor-pointer" />
                  <h3 className="text-xs font-bold uppercase" style={{ color: theme.colors.muted }}>{selectedAdviceIds.length} of {advices.length} Selected</h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase block" style={{ color: theme.colors.muted }}>Selected Total</span>
                  <span className="text-lg font-bold" style={{ color: theme.colors.secondary }}>₹ {grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
              
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse text-xs min-w-[750px]">
                  <thead>
                    <tr className="border-b font-bold uppercase" style={{ borderColor: theme.colors.border, backgroundColor: theme.colors.surface, color: theme.colors.muted }}>
                      <th className="px-3 py-3 w-10 text-center">Select</th>
                      <th className="px-3 py-3 w-10 text-center">Sl.</th> 
                      <th className="px-3 py-3">Advice Details</th>
                      <th className="px-3 py-3">Bank</th>
                      <th className="px-3 py-3 text-right">Amount</th>
                      <th className="px-3 py-3 w-32">Cheque No.</th>
                      <th className="px-3 py-3 w-32">Block Letter</th>
                    </tr>
                  </thead>
                  <tbody>
                    {advices.map((a, index) => {
                      const isSelected = selectedAdviceIds.includes(a._id);
                      return (
                        <tr key={a._id} className="border-b" style={{ borderColor: theme.colors.border, backgroundColor: isSelected ? `${theme.colors.secondary}08` : 'transparent', opacity: isSelected ? 1 : 0.5 }}>
                          <td className="px-3 py-2 text-center">
                            <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(a._id)} className="w-4 h-4 cursor-pointer" />
                          </td>
                          <td className="px-3 py-2 text-center font-mono font-bold" style={{ color: theme.colors.muted }}>
                            {index + 1}.
                          </td>
                          <td className="px-3 py-2">
                            <div className="font-mono font-semibold text-[11px]" style={{ color: theme.colors.text }}>{a.adviceNumber || 'N/A'}</div>
                            <div className="text-[10px]" style={{ color: theme.colors.muted }}>{new Date(a.adviceDate).toLocaleDateString('en-IN')}</div>
                          </td>
                          <td className="px-3 py-2 font-semibold text-[11px]" style={{ color: theme.colors.text }}>{a.clfBankDetails?.bankName || a.bankName}</td>
                          <td className="px-3 py-2 text-right font-mono font-bold" style={{ color: theme.colors.secondary }}>₹ {a.totalAmount.toLocaleString('en-IN')}</td>
                          <td className="px-3 py-2">
                            <input 
                              type="text" placeholder="Cheque No" value={inputs[a._id]?.chequeNumber || ''} 
                              onChange={(e) => handleInputChange(a._id, 'chequeNumber', e.target.value)} disabled={!isSelected}
                              className="w-full px-2 py-1.5 text-xs border rounded"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input 
                              type="text" placeholder="Block Letter" value={inputs[a._id]?.blockLetterNumber || ''} 
                              onChange={(e) => handleInputChange(a._id, 'blockLetterNumber', e.target.value)} disabled={!isSelected}
                              className="w-full px-2 py-1.5 text-xs border rounded"
                            />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div className="p-4 border-t flex justify-end" style={{ borderColor: theme.colors.border }}>
                <Button onClick={handleGenerate} loading={generating} style={{ padding: '10px 24px' }} disabled={selectedAdviceIds.length === 0}>
                  📄 Generate Top Sheet PDF
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-sm border rounded" style={{ color: theme.colors.muted, borderColor: theme.colors.border }}>
              Select month and click "Fetch Advices".
            </div>
          )}

          {/* ✅ NAYA: Frontend Print Preview (Agar aap frontend wala formate use karna chahte hain toh) */}
          {topSheetData && selectedBankObj && clfData && (
            <div className="mt-8">
              <h3 className="text-sm font-bold uppercase mb-4" style={{ color: theme.colors.primary }}>Top Sheet Preview</h3>
              <TopSheetFormate 
                topSheetData={topSheetData} 
                clfBank={selectedBankObj} 
                month={month} 
                inputs={inputs} 
                clfData={clfData} 
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}