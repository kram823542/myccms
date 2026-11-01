import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Badge from '../../components/ui/Badge.jsx';
import { theme } from '../../config/theme.js';

export default function EmployeeRow({
  employee,
  basePath,
  canReset,
  canDelete,
  onReset,
  onDelete,
  onToggleStatus,
}) {
  const [openMenu, setOpenMenu] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(e.target) && 
        buttonRef.current && 
        !buttonRef.current.contains(e.target)
      ) {
        setOpenMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpenMenu = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX - 200,
      });
    }
    setOpenMenu((v) => !v);
  };

  const isActive = employee.status === 'ACTIVE';
  const dp = employee.profilePhoto || employee.userId?.profilePhoto || null;
  const initial = (employee.name || '?').charAt(0).toUpperCase();

  return (
    <tr style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
      
      <td style={{ padding: '12px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40, height: 40, borderRadius: '50%',
              background: `${theme.colors.primary}15`,
              border: `1px solid ${theme.colors.primary}40`,
              color: theme.colors.primary,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 'bold', overflow: 'hidden', flexShrink: 0,
            }}
          >
            {dp ? (
              <img src={dp} alt={employee.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              initial
            )}
          </div>

          <div>
            <div style={{ fontWeight: 600, color: theme.colors.text, fontSize: 14 }}>
              {employee.name || '—'}
            </div>
            <div style={{ fontSize: 12, color: theme.colors.muted, marginTop: 2 }}>
              {employee.employeeCode || '—'} • {employee.clfId?.name || '—'}
            </div>
          </div>
        </div>
      </td>

      <td style={{ padding: '12px 14px' }}>{employee.mobile}</td>
      <td style={{ padding: '12px 14px' }}>{employee.designation}</td>
      <td style={{ padding: '12px 14px', color: theme.colors.muted }}>
        {employee.workLocation?.panchayat || '—'}
      </td>
      <td style={{ padding: '12px 14px' }}>
        <Badge variant={isActive ? 'success' : 'danger'}>{employee.status}</Badge>
      </td>
      <td style={{ padding: '12px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {basePath && (
            <Link
              to={`${basePath}/employees/${employee._id}`}
              style={{ 
                color: theme.colors.primary, 
                fontWeight: 600, 
                fontSize: 13,
                padding: '6px 12px',
                borderRadius: 8,
                background: `${theme.colors.primary}10`,
                textDecoration: 'none',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = `${theme.colors.primary}20`}
              onMouseLeave={(e) => e.currentTarget.style.background = `${theme.colors.primary}10`}
            >
              View
            </Link>
          )}

          {(canReset || canDelete) && (
            <div style={{ position: 'relative' }}>
              <button
                ref={buttonRef}
                onClick={handleOpenMenu}
                style={{
                  background: openMenu ? theme.colors.background : 'transparent',
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '8px',
                  width: 32, height: 32,
                  cursor: 'pointer',
                  color: theme.colors.text,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = theme.colors.background}
                onMouseLeave={(e) => !openMenu && (e.currentTarget.style.background = 'transparent')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="12" cy="5" r="1"></circle>
                  <circle cx="12" cy="19" r="1"></circle>
                </svg>
              </button>

              {openMenu && (
                <div
                  ref={menuRef}
                  style={{
                    position: 'fixed',
                    top: menuPos.top,
                    left: menuPos.left,
                    background: theme.colors.surface,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '12px',
                    boxShadow: theme.shadow.lg,
                    minWidth: 220,
                    zIndex: 9999,
                    overflow: 'hidden',
                    padding: '6px'
                  }}
                >
                  {canReset && (
                    <MenuItem
                      icon={
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
                        </svg>
                      }
                      label="Manage Login"
                      color={theme.colors.text}
                      onClick={() => {
                        setOpenMenu(false);
                        onReset?.(employee);
                      }}
                    />
                  )}

                  {canDelete && onToggleStatus && (
                    <MenuItem
                      icon={
                        isActive ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                          </svg>
                        )
                      }
                      label={isActive ? 'Deactivate' : 'Activate'}
                      color={theme.colors.warning}
                      onClick={() => {
                        setOpenMenu(false);
                        onToggleStatus?.(employee);
                      }}
                    />
                  )}

                  {canDelete && (
                    <MenuItem
                      icon={
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      }
                      label="Delete Permanently"
                      color={theme.colors.danger}
                      onClick={() => {
                        setOpenMenu(false);
                        onDelete?.(employee);
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

function MenuItem({ icon, label, color, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width: '100%',
        textAlign: 'left',
        padding: '10px 12px',
        background: 'transparent',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: 13,
        color,
        fontWeight: 600,
        transition: 'background 0.2s'
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = theme.colors.background)}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.8 }}>
        {icon}
      </span>
      <span>{label}</span>
    </button>
  );
}