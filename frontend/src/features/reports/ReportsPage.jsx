import { useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import { getAuthUser, setAuthUser } from '../../utils/authStorage.js';
import Loader from '../../components/ui/Loader.jsx';
import Input from '../../components/ui/Input.jsx';
import { theme } from '../../config/theme.js';
import apiClient from '../../services/apiClient.js';
import * as api from './reports.api.js';
import EmployeeReportRow from './components/EmployeeReportRow.jsx';
import ReportDownloadModal from './components/ReportDownloadModal.jsx';
import ReportCard from './ReportCard.jsx';
import Badge from '../../components/ui/Badge.jsx';

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export default function ReportsPage() {
  const user = getAuthUser() || {};
  const isEmployee = user.role === 'EMPLOYEE';
  if (isEmployee) return <EmployeeReportsView user={user} />;
  return <AdminReportsView />;
}

function AdminReportsView() {
  const [employees, setEmployees] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [modal, setModal] = useState({ open: false, employee: null, type: null, bulk: 0 });

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.fetchEmployeesForReports({ page: 1, limit: 500, search });
      setEmployees(data.data.employees || []);
    } catch (err) { console.error('Load employees error:', err); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search]);

  const toggleSelect = (id, checked) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id); else next.delete(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === employees.length) setSelected(new Set());
    else setSelected(new Set(employees.map((e) => e._id)));
  };

  const performDownload = async ({ year, month }) => {
    const isAP = modal.type === 'action-plan';
    const fetcher = isAP ? api.downloadActionPlanPDF : api.downloadWorkDonePDF;
    const ext = isAP ? 'action-plan' : 'work-done';

    if (modal.bulk > 0) {
      setBulkLoading(true);
      try {
        const ids = Array.from(selected);
        for (let i = 0; i < ids.length; i++) {
          const id = ids[i];
          const { data } = await fetcher({ employeeId: id, year, month });
          const emp = employees.find((e) => e._id === id);
          const code = emp?.employeeCode || `emp-${i + 1}`;
          downloadBlob(data, `${ext}-${code}-${year}-${month}.pdf`);
          await new Promise((r) => setTimeout(r, 300));
        }
      } finally {
        setBulkLoading(false);
        setSelected(new Set());
      }
      return;
    }

    const { data } = await fetcher({ employeeId: modal.employee._id, year, month });
    downloadBlob(data, `${ext}-${modal.employee.employeeCode}-${year}-${month}.pdf`);
  };

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle={`${employees.length} employee(s)`}
        actions={
          selected.size > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Button variant="outline" onClick={() => setModal({ open: true, employee: null, type: 'action-plan', bulk: selected.size })} disabled={bulkLoading}>Action Plan PDFs ({selected.size})</Button>
              <Button variant="outline" onClick={() => setModal({ open: true, employee: null, type: 'work-done', bulk: selected.size })} disabled={bulkLoading}>Work Done PDFs ({selected.size})</Button>
            </div>
          )
        }
      />

      <div style={{ marginBottom: 14, maxWidth: 320 }}>
        <Input placeholder="Search by name, code, mobile..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div style={{ background: theme.colors.surface, borderRadius: theme.radius.md, boxShadow: theme.shadow.sm, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: theme.colors.background }}>
                <th style={{ padding: '12px 14px', width: 40 }}><input type="checkbox" checked={selected.size > 0 && selected.size === employees.length} onChange={toggleSelectAll} style={{ cursor: 'pointer', width: 16, height: 16 }} /></th>
                <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600 }}>Code</th>
                <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600 }}>Name</th>
                <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600 }}>Designation</th>
                <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600 }}>Panchayat</th>
                <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: theme.colors.muted }}>No employees found</td></tr>
              ) : (
                employees.map((emp) => (
                  <EmployeeReportRow key={emp._id} employee={{ ...emp, _selected: selected.has(emp._id) }} onSelect={toggleSelect} onAction={(employee, type) => setModal({ open: true, employee, type, bulk: 0 })} />
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <ReportDownloadModal open={modal.open} onClose={() => setModal({ open: false, employee: null, type: null, bulk: 0 })} employee={modal.employee} type={modal.type} bulkCount={modal.bulk} onDownload={performDownload} />
    </>
  );
}

function EmployeeReportsView({ user }) {
  const [modal, setModal] = useState({ open: false, type: null });
  const [employeeId, setEmployeeId] = useState(user.employeeId || null);
  const [loadingId, setLoadingId] = useState(!user.employeeId);

  useEffect(() => {
    if (user.employeeId) { setEmployeeId(user.employeeId); setLoadingId(false); return; }
    let cancelled = false;
    (async () => {
      try {
        const { data } = await apiClient.get('/auth/me');
        const empId = data?.data?.employeeId;
        if (!cancelled && empId) {
          setEmployeeId(empId);
          const updated = { ...user, employeeId: empId };
          setAuthUser(updated);
        }
      } catch (err) { console.error('Failed to fetch employeeId:', err); } finally { if (!cancelled) setLoadingId(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleDownload = async ({ year, month }) => {
    if (!employeeId) return alert('Employee record नहीं मिला। कृपया logout करके दुबारा login करें।');
    const isAP = modal.type === 'action-plan';
    const fetcher = isAP ? api.downloadActionPlanPDF : api.downloadWorkDonePDF;
    const ext = isAP ? 'action-plan' : 'work-done';
    const { data } = await fetcher({ employeeId, year, month });
    downloadBlob(data, `${ext}-${user.username}-${year}-${month}.pdf`);
  };

  if (loadingId) return <Loader text="Loading your profile..." />;

  const employeeInfo = { _id: employeeId, name: user.name, employeeCode: user.username, designation: '—', workLocation: {} };

  return (
    <>
      <PageHeader title="Reports" subtitle="Download your monthly reports" />
      {!employeeId && (<div style={{ padding: 14, background: `${theme.colors.danger}10`, color: theme.colors.danger, borderRadius: theme.radius.md, marginBottom: 16, fontSize: 13 }}>⚠️ Employee record नहीं मिला। कृपया <b>logout करके दुबारा login</b> करें।</div>)}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
        <ReportCard icon="📝" title="Action Plan Report" description="Download your monthly action plan PDF (A4)" onDownload={() => employeeId && setModal({ open: true, type: 'action-plan' })} />
        <ReportCard icon="✅" title="Work Done Report" description="Download your monthly work done PDF with approvals" onDownload={() => employeeId && setModal({ open: true, type: 'work-done' })} />
      </div>
      <ReportDownloadModal open={modal.open} onClose={() => setModal({ open: false, type: null })} employee={employeeInfo} type={modal.type} onDownload={handleDownload} />
    </>
  );
}