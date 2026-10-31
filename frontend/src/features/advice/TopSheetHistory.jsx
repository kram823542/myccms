import { useEffect, useState } from 'react';
import Loader from '../../components/ui/Loader.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Button from '../../components/ui/Button.jsx';
import * as adviceApi from './advice.api.js';
import toast from 'react-hot-toast';
import { theme } from '../../config/theme.js';

export default function TopSheetHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null); // ✅ Modal ke liye

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await adviceApi.getTopSheetHistory();
        setHistory(data?.data || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return <div className="py-12 flex justify-center"><Loader /></div>;

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 border rounded-xl border-dashed" style={{ borderColor: theme.colors.border, backgroundColor: theme.colors.surface }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${theme.colors.primary}10`, color: theme.colors.primary }}>
          <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>
        <h3 className="text-base font-bold mb-1" style={{ color: theme.colors.text }}>No History Found</h3>
        <p className="text-xs" style={{ color: theme.colors.muted }}>Aapne abhi tak koi Top Sheet generate nahi ki hai.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {history.map((item) => (
          <div 
            key={item._id} 
            className="flex flex-col rounded-xl border transition-all hover:-translate-y-1 hover:shadow-md"
            style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}
          >
            {/* Card Header: Month & Date */}
            <div className="p-4 border-b flex justify-between items-start" style={{ borderColor: `${theme.colors.border}50` }}>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: theme.colors.muted }}>
                  Top Sheet
                </span>
                <h3 className="text-xl font-extrabold" style={{ color: theme.colors.primary }}>
                  {item.month}
                </h3>
              </div>
              <Badge variant="info" showDot={false}>
                {item.adviceCount} Advices
              </Badge>
            </div>

            {/* Card Body: Bank Details */}
            <div className="p-4 flex-1 space-y-3">
              <div>
                <p className="text-[10px] font-bold uppercase mb-1" style={{ color: theme.colors.muted }}>Bank Account</p>
                <p className="text-sm font-semibold truncate" style={{ color: theme.colors.text }}>
                  {item.bankName}
                </p>
                <p className="text-xs font-mono mt-0.5" style={{ color: theme.colors.muted }}>
                  A/c: {item.accountNumber}
                </p>
              </div>
              
              <div>
                <p className="text-[10px] font-bold uppercase mb-1" style={{ color: theme.colors.muted }}>Grand Total</p>
                <p className="text-lg font-bold font-mono" style={{ color: theme.colors.secondary }}>
                  ₹ {item.grandTotal.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* Card Footer: Action */}
            <div className="px-4 py-3 rounded-b-xl border-t flex justify-between items-center" style={{ borderColor: `${theme.colors.border}50`, backgroundColor: theme.colors.background }}>
              <span className="text-[10px] font-medium" style={{ color: theme.colors.muted }}>
                {new Date(item.createdAt).toLocaleDateString('en-IN')}
              </span>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setSelectedItem(item)}
                style={{ padding: '4px 12px', fontSize: 11 }}
              >
                View Details
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ NAYA: Details Modal */}
      <Modal 
        open={!!selectedItem} 
        onClose={() => setSelectedItem(null)} 
        title={`Top Sheet Details — ${selectedItem?.month}`}
        size="lg"
      >
        {selectedItem && (
          <div className="space-y-4">
            {/* Bank Info */}
            <div className="p-3 rounded-lg border" style={{ borderColor: theme.colors.border, backgroundColor: theme.colors.background }}>
              <h4 className="text-xs font-bold uppercase mb-2" style={{ color: theme.colors.primary }}>Bank Information</h4>
              <p className="text-sm font-semibold">{selectedItem.bankName}</p>
              <p className="text-xs font-mono">A/c: {selectedItem.accountNumber}</p>
            </div>

            {/* Advices List */}
            <div>
              <h4 className="text-xs font-bold uppercase mb-2" style={{ color: theme.colors.muted }}>Included Advices</h4>
              <div className="space-y-3">
                {selectedItem.advices?.map((adv, idx) => (
                  <div key={idx} className="border rounded-lg overflow-hidden" style={{ borderColor: theme.colors.border }}>
                    <div className="p-2 flex justify-between items-center" style={{ backgroundColor: theme.colors.background }}>
                      <span className="text-xs font-bold" style={{ color: theme.colors.text }}>{adv.adviceNumber}</span>
                      <span className="text-xs font-semibold" style={{ color: theme.colors.secondary }}>₹ {adv.totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="p-2 space-y-2">
                      {adv.employees?.map((emp, i) => (
                        <div key={i} className="flex justify-between items-center text-[11px] border-b last:border-0 pb-1 last:pb-0" style={{ borderColor: `${theme.colors.border}50` }}>
                          <div>
                            <span className="font-semibold" style={{ color: theme.colors.text }}>{emp.name}</span>
                            <span className="ml-1 text-gray-500">({emp.designation || 'N/A'})</span>
                          </div>
                          <div className="text-right">
                            <div className="font-mono" style={{ color: theme.colors.text }}>₹ {emp.amount}</div>
                            <div className="text-[9px] font-mono text-gray-400">{emp.accountNumber}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}