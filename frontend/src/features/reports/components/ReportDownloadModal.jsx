import { useEffect, useState } from 'react';
import Modal from '../../../components/ui/Modal.jsx';
import Button from '../../../components/ui/Button.jsx';
import Input from '../../../components/ui/Input.jsx';
import Select from '../../../components/ui/Select.jsx';
import { theme } from '../../../config/theme.js';
import apiClient from '../../../services/apiClient.js'; //  API client

const getDefaultMonths = () =>
  Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(0, i).toLocaleString('default', { month: 'long' }),
  }));

export default function ReportDownloadModal({
  open,
  onClose,
  employee,
  type,
  onDownload,
  bulkCount = 0,
}) {
  const [initialPeriod] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });
  const [year, setYear] = useState(initialPeriod.year);
  const [month, setMonth] = useState(initialPeriod.month);
  const [monthsList, setMonthsList] = useState([]); //  Backend se aane wale months
  const [loading, setLoading] = useState(false);

  //  Backend se dynamic months list fetch karna (localization support ke sath)
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const fetchMonths = async () => {
      try {
        const { data } = await apiClient.get('/config/months');
        if (!cancelled) setMonthsList(data.data || getDefaultMonths());
      } catch {
        if (!cancelled) setMonthsList(getDefaultMonths());
      }
    };
    fetchMonths();
    return () => { cancelled = true; };
  }, [open]);

  const isBulk = bulkCount > 0;
  const title = isBulk
    ? `Download ${bulkCount} Reports`
    : type === 'action-plan'
    ? 'Download Action Plan Report'
    : 'Download Work Done Report';

  const handleDownload = async () => {
    setLoading(true);
    try {
      await onDownload?.({ year: Number(year), month: Number(month) });
      onClose();
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {isBulk ? (
          <div style={{ background: theme.colors.background, padding: 12, borderRadius: theme.radius.sm, fontSize: 13 }}>
            <b>{bulkCount} employees selected</b>
            <div style={{ color: theme.colors.muted, marginTop: 2 }}>
              {type === 'action-plan' ? 'Action Plan' : 'Work Done'} report — सभी की PDF download होंगी
            </div>
          </div>
        ) : (
          employee && (
            <div style={{ background: theme.colors.background, padding: 12, borderRadius: theme.radius.sm, fontSize: 13 }}>
              <div>
                <b>{employee.name}</b>
                {employee.employeeCode && employee.employeeCode !== 'BULK' && (<> ({employee.employeeCode})</>)}
              </div>
              {employee.designation && employee.designation !== '—' && (
                <div style={{ color: theme.colors.muted, marginTop: 2 }}>
                  {employee.designation}
                  {employee.workLocation?.panchayat && ` • ${employee.workLocation.panchayat}`}
                </div>
              )}
            </div>
          )
        )}

        <Input label="Year" type="number" value={year} onChange={(e) => setYear(e.target.value)} min="2020" max="2100" />

        <Select
          label="Month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          options={monthsList}
        />

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
          <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleDownload} loading={loading}>Download PDF</Button>
        </div>
      </div>
    </Modal>
  );
}