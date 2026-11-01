import { useEffect, useRef, useState } from 'react';
import Badge from '../../../components/ui/Badge.jsx';
import { theme } from '../../../config/theme.js';

export default function EmployeeReportRow({ employee, onSelect, onAction }) {
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <tr style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
      <td style={{ padding: '12px 14px' }}>
        <input
          type="checkbox"
          checked={!!employee._selected}
          onChange={(e) => onSelect?.(employee._id, e.target.checked)}
          style={{ cursor: 'pointer', width: 16, height: 16 }}
        />
      </td>
      <td style={{ padding: '12px 14px', fontWeight: 500 }}>
        {employee.employeeCode}
      </td>
      <td style={{ padding: '12px 14px' }}>{employee.name}</td>
      <td style={{ padding: '12px 14px', color: theme.colors.muted }}>
        {employee.designation}
      </td>
      <td style={{ padding: '12px 14px', color: theme.colors.muted }}>
        {employee.workLocation?.panchayat || '—'}
      </td>
      <td style={{ padding: '12px 14px' }}>
        <Badge variant={employee.status === 'ACTIVE' ? 'success' : 'danger'}>
          {employee.status}
        </Badge>
      </td>
      <td style={{ padding: '12px 14px' }}>
        <div style={{ position: 'relative', display: 'inline-block' }} ref={menuRef}>
          <button
            onClick={() => setOpenMenu((v) => !v)}
            style={{
              background: 'transparent',
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.radius.sm,
              width: 32,
              height: 32,
              cursor: 'pointer',
              fontSize: 18,
              lineHeight: 1,
              color: theme.colors.text,
            }}
            title="More options"
          >
            ⋮
          </button>

          {openMenu && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '100%',
                marginTop: 4,
                background: theme.colors.surface,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.radius.sm,
                boxShadow: theme.shadow.md,
                minWidth: 200,
                zIndex: 100,
                overflow: 'hidden',
              }}
            >
              <MenuItem
                label="Action Plan Detail"
                onClick={() => {
                  setOpenMenu(false);
                  onAction?.(employee, 'action-plan');
                }}
              />
              <MenuItem
                label="Work Done Detail"
                onClick={() => {
                  setOpenMenu(false);
                  onAction?.(employee, 'work-done');
                }}
              />
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

function MenuItem({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        padding: '10px 14px',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontSize: 13,
        color: theme.colors.text,
        borderBottom: `1px solid ${theme.colors.border}`,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = theme.colors.background)}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      {label}
    </button>
  );
}