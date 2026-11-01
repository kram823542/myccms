import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import Loader from '../../components/ui/Loader.jsx';
import Badge from '../../components/ui/Badge.jsx';
import AttendanceFilter from './AttendanceFilter.jsx';
import { theme } from '../../config/theme.js';
import { listEmployees } from '../employees/employees.api.js';
import { getAuthUser } from '../../utils/authStorage.js';
import * as api from './attendance.api.js';
import toast from 'react-hot-toast';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const STATUS_UI = {
  PRESENT: { label: 'P', bg: `${theme.colors.success}20`, color: theme.colors.success, border: `${theme.colors.success}50` },
  ABSENT:  { label: 'A', bg: `${theme.colors.danger}20`, color: theme.colors.danger, border: `${theme.colors.danger}50` },
  LEAVE:   { label: 'L', bg: `${theme.colors.info}20`, color: theme.colors.info, border: `${theme.colors.info}50` }, 
};

const daysInMonth = (year, month) => new Date(year, month, 0).getDate();
const fmt = (y, m, d) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

export default function AttendancePage() {
  const user = getAuthUser() || {};
  const isEmployee = user.role === 'EMPLOYEE';

  const now = new Date();
  const [filters, setFilters] = useState({ month: now.getMonth() + 1, year: now.getFullYear(), employeeId: '' });
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (isEmployee) return;
    (async () => {
      try {
        const { data } = await listEmployees({ page: 1, limit: 500 });
        setEmployees(data.data.employees || []);
      } catch (err) { console.error(err); }
    })();
  }, [isEmployee]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setAttendance([]); 
      try {
        const y = Number(filters.year);
        const m = Number(filters.month);
        const lastDay = daysInMonth(y, m);
        const params = { from: fmt(y, m, 1), to: fmt(y, m, lastDay) };
        if (filters.employeeId) params.employeeId = filters.employeeId;
        const { data } = await api.listAttendance(params);
        if (!cancelled) setAttendance(data.data.attendance || []);
      } catch (err) {
        console.error(err);
        if (!cancelled) setAttendance([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [filters.month, filters.year, filters.employeeId]);

  const year = Number(filters.year);
  const month = Number(filters.month);
  const totalDays = daysInMonth(year, month);

  const matrix = useMemo(() => {
    const map = new Map();
    if (!isEmployee) {
      const list = filters.employeeId ? employees.filter((e) => e._id === filters.employeeId) : employees;
      list.forEach((e) => {
        map.set(e._id, { employee: { _id: e._id, name: e.name, code: e.employeeCode, designation: e.designation || '—' }, days: {} });
      });
    }
    attendance.forEach((a) => {
      const empId = a.employeeId?._id || a.employeeId;
      const day = Number(a.date.split('-')[2]);
      if (!map.has(empId)) {
        map.set(empId, { employee: { _id: empId, name: a.employeeId?.name || user.name || '—', code: a.employeeId?.employeeCode || user.username || '—', designation: a.employeeId?.designation || '—' }, days: {} });
      }
      map.get(empId).days[day] = a.status;
    });
    return Array.from(map.values()).sort((a, b) => String(a.employee.code).localeCompare(String(b.employee.code)));
  }, [attendance, employees, filters.employeeId, isEmployee, user]);

  const totals = useMemo(() => {
    let p = 0, a = 0, l = 0; 
    attendance.forEach((row) => {
      if (row.status === 'PRESENT') p++;
      else if (row.status === 'ABSENT') a++;
      else if (row.status === 'LEAVE') l++; 
    });
    return { p, a, l };
  }, [attendance]);

  const handleExport = async () => {
    try {
      setExporting(true);
      const res = await api.exportAttendanceCSV({ from: fmt(year, month, 1), to: fmt(year, month, totalDays) });
      const blobData = res?.data instanceof Blob ? res.data : res;
      const blob = new Blob([blobData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Attendance_${MONTHS[month - 1]}_${year}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Excel Downloaded!');
    } catch (err) {
      toast.error('Failed to export attendance.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Attendance"
        subtitle={`${MONTHS[month - 1]} ${year} — ${matrix.length} employee(s)`}
        actions={<Button variant="ghost" onClick={handleExport} loading={exporting}>Export Excel</Button>}
      />

      <AttendanceFilter filters={filters} onChange={setFilters} showEmployeeFilter={!isEmployee} employees={employees} />

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, fontSize: 13, alignItems: 'center' }}>
        <Badge variant="success" showDot={false}>P: {totals.p}</Badge>
        <Badge variant="danger" showDot={false}>A: {totals.a}</Badge>
        <Badge variant="info" showDot={false}>L: {totals.l}</Badge>
      </div>

      {loading ? (
        <Loader />
      ) : matrix.length === 0 ? (
        <div style={{ padding: 40, background: theme.colors.surface, borderRadius: theme.radius.md, boxShadow: theme.shadow.sm, border: `1px solid ${theme.colors.border}`, textAlign: 'center', color: theme.colors.muted, fontSize: 13 }}>
          <b>{MONTHS[month - 1]} {year}</b> ke liye koi attendance record nahi mila.
        </div>
      ) : (
        <AttendanceMatrix matrix={matrix} totalDays={totalDays} />
      )}
    </>
  );
}

function AttendanceMatrix({ matrix, totalDays }) {
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);
  const nameColWidth = 180;
  const dayColWidth = 28;
  const totalColWidth = 36;

  return (
    <div style={{ background: theme.colors.surface, borderRadius: theme.radius.md, boxShadow: theme.shadow.sm, border: `1px solid ${theme.colors.border}`, overflowX: 'auto', width: '100%' }}>
      <table style={{ borderCollapse: 'separate', borderSpacing: 0, fontSize: 11, width: '100%', minWidth: nameColWidth + (totalDays * dayColWidth) + (totalColWidth * 3) }}>
        <colgroup>
          <col style={{ width: nameColWidth }} />
          {days.map((d) => <col key={d} style={{ width: dayColWidth }} />)}
          <col style={{ width: totalColWidth }} />
          <col style={{ width: totalColWidth }} />
          <col style={{ width: totalColWidth }} />
        </colgroup>
        <thead>
          <tr>
            <th style={{ position: 'sticky', top: 0, left: 0, zIndex: 4, background: theme.colors.background, padding: '10px 12px', textAlign: 'left', fontWeight: 700, fontSize: 10, color: theme.colors.text, borderBottom: `1px solid ${theme.colors.border}` }}>EMPLOYEE</th>
            {days.map((d) => <th key={d} style={{ position: 'sticky', top: 0, zIndex: 2, background: theme.colors.background, padding: '8px 0', textAlign: 'center', fontWeight: 600, fontSize: 10, color: theme.colors.muted, borderBottom: `1px solid ${theme.colors.border}` }}>{d}</th>)}
            <th style={{ position: 'sticky', top: 0, right: totalColWidth * 2, zIndex: 4, background: theme.colors.background, padding: '8px 4px', textAlign: 'center', fontWeight: 700, fontSize: 10, color: theme.colors.success, borderBottom: `1px solid ${theme.colors.border}`, borderLeft: `1px solid ${theme.colors.border}` }}>P</th>
            <th style={{ position: 'sticky', top: 0, right: totalColWidth, zIndex: 4, background: theme.colors.background, padding: '8px 4px', textAlign: 'center', fontWeight: 700, fontSize: 10, color: theme.colors.danger, borderBottom: `1px solid ${theme.colors.border}` }}>A</th>
            <th style={{ position: 'sticky', top: 0, right: 0, zIndex: 4, background: theme.colors.background, padding: '8px 4px', textAlign: 'center', fontWeight: 700, fontSize: 10, color: theme.colors.info, borderBottom: `1px solid ${theme.colors.border}` }}>L</th>
          </tr>
        </thead>
        <tbody>
          {matrix.map(({ employee, days: dayMap }) => {
            let pCount = 0, aCount = 0, lCount = 0;
            days.forEach((d) => {
              if (dayMap[d] === 'PRESENT') pCount++;
              else if (dayMap[d] === 'ABSENT') aCount++;
              else if (dayMap[d] === 'LEAVE') lCount++; 
            });
            return (
              <tr key={employee._id}>
                <td style={{ position: 'sticky', left: 0, zIndex: 3, background: theme.colors.surface, padding: '8px 12px', borderBottom: `1px solid ${theme.colors.border}` }}>
                  <div style={{ fontWeight: 600, fontSize: 12, color: theme.colors.text }}>{employee.name}</div>
                  <div style={{ fontSize: 10, color: theme.colors.muted }}>{employee.code} • {employee.designation}</div>
                </td>
                {days.map((d) => {
                  const status = dayMap[d];
                  const ui = STATUS_UI[status];
                  return (
                    <td key={d} style={{ padding: '2px 0', textAlign: 'center', borderBottom: `1px solid ${theme.colors.border}` }}>
                      <div style={{ width: 20, height: 20, margin: '0 auto', borderRadius: 4, background: ui?.bg || theme.colors.background, color: ui?.color || theme.colors.muted, border: `1px solid ${ui?.border || theme.colors.border}`, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }} title={status || 'No record'}>{ui?.label || ''}</div>
                    </td>
                  );
                })}
                <td style={{ position: 'sticky', right: totalColWidth * 2, zIndex: 3, background: theme.colors.surface, padding: '6px 4px', textAlign: 'center', fontWeight: 700, fontSize: 11, color: theme.colors.success, borderBottom: `1px solid ${theme.colors.border}`, borderLeft: `1px solid ${theme.colors.border}` }}>{pCount}</td>
                <td style={{ position: 'sticky', right: totalColWidth, zIndex: 3, background: theme.colors.surface, padding: '6px 4px', textAlign: 'center', fontWeight: 700, fontSize: 11, color: theme.colors.danger, borderBottom: `1px solid ${theme.colors.border}` }}>{aCount}</td>
                <td style={{ position: 'sticky', right: 0, zIndex: 3, background: theme.colors.surface, padding: '6px 4px', textAlign: 'center', fontWeight: 700, fontSize: 11, color: theme.colors.info, borderBottom: `1px solid ${theme.colors.border}` }}>{lCount}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}