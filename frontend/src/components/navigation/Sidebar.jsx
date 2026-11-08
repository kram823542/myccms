import { useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { theme } from '../../config/theme.js';
import { clearAuthState, getAuthUser } from '../../utils/authStorage.js';
import { getEmployee } from '../../features/employees/employees.api.js'; //  Import API

// Shared by Sidebar and BottomBar; keeping it here avoids duplicating the route icon map.
// oxlint-disable-next-line react/only-export-components
export const renderDynamicIcon = (item, size = 20) => {
  // ... (Tumhara purana icon logic same rahega) ...
  const label = (item.label || '').toLowerCase();
  const path = (item.path || '').toLowerCase();
  const common = { width: size, height: size, fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round', viewBox: '0 0 24 24', style: { minWidth: size } };

  if (label.includes('dashboard') || path.endsWith('/super-admin') || path.endsWith('/bpm') || path.endsWith('/clf') || path.endsWith('/employee')) {
    return <svg {...common}><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
  }
  if (label.includes('action') || path.includes('action-plan') || path.includes('action')) {
    return <svg {...common}><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;
  }
  if (label.includes('work') || path.includes('work-done') || path.includes('work')) {
    return <svg {...common}><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
  }
  if (label.includes('attendance') || path.includes('attendance')) {
    return <svg {...common}><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
  }
  if (label.includes('leave') || path.includes('leave')) {
    return <svg {...common}><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
  }
  if (label.includes('notification') || path.includes('notification')) {
    return <svg {...common}><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
  }
  if (label.includes('report') || path.includes('report')) {
    return <svg {...common}><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
  }
  if (label.includes('approval') || label.includes('submit') || label.includes('advice') || path.includes('approval') || path.includes('advice')) {
    return <svg {...common}><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
  }
  if (label.includes('clf') || path.includes('/clfs')) {
    return <svg {...common}><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0V7m0 4h4m-4 0H7" /></svg>;
  }
  if (label.includes('block') || path.includes('blocks')) {
    return <svg {...common}><path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
  }
  if (label.includes('audit') || label.includes('log') || path.includes('audit')) {
    return <svg {...common}><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
  }
  if (label.includes('employee') || label.includes('user') || path.includes('/employees') || path.includes('/users')) {
    return <svg {...common}><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5 5 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
  }
  if (label.includes('top sheet') || label.includes('topsheet') || path.includes('topsheet')) {
    return <svg {...common}><path d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>;
  }
  if (label.includes('resource') || path.includes('resource')) {
    return <svg {...common}><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0V7m0 4h4m-4 0H7" /></svg>;
  }
  return <svg {...common}><path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>;
};

export default function Sidebar({ title, menu = [] }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [user, setUser] = useState(getAuthUser() || {}); //  State me rakha
  const activeIndex = useMemo(() => {
    let currentPath = location.pathname;
    if (currentPath.endsWith('/') && currentPath.length > 1) currentPath = currentPath.slice(0, -1);

    let bestMatchIndex = -1;
    let longestLength = 0;
    menu.forEach((item, index) => {
      let itemPath = item.path || '';
      if (itemPath.endsWith('/') && itemPath.length > 1) itemPath = itemPath.slice(0, -1);
      if (
        (currentPath === itemPath || currentPath.startsWith(itemPath + '/')) &&
        itemPath.length > longestLength
      ) {
        bestMatchIndex = index;
        longestLength = itemPath.length;
      }
    });
    return bestMatchIndex;
  }, [location.pathname, menu]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState({ show: false, label: '', top: 0 });

  //  NAYA: Agar Employee hai, toh API se sahi naam fetch karo
  useEffect(() => {
    if (user.role === 'EMPLOYEE' && user.employeeId) {
      getEmployee(user.employeeId)
        .then(({ data }) => {
          if (data.data && data.data.name) {
            setUser(prev => ({ ...prev, name: data.data.name }));
          }
        })
        .catch(() => {});
    }
  }, [user.role, user.employeeId]);

  useEffect(() => {
    document.body.dataset.sidebar = isCollapsed ? 'collapsed' : 'expanded';
    return () => { document.body.dataset.sidebar = ''; };
  }, [isCollapsed]);

  const handleLogout = () => {
    clearAuthState();
    navigate('/login');
  };

  const handleMouseEnter = (event, label) => {
    if (!isCollapsed) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setActiveTooltip({ show: true, label, top: rect.top + rect.height / 2 });
  };

  const handleMouseLeave = () => {
    setActiveTooltip({ show: false, label: '', top: 0 });
  };

  const sidebarWidth = isCollapsed ? 64 : 210;
  const itemHeight = 40;
  const itemGap = 10;

  return (
    <>
      <aside
        className="clf-sidebar"
        style={{
          position: 'fixed', left: 0, top: 0, bottom: 0, width: sidebarWidth,
          background: theme.colors.sidebarBg, borderRight: `1px solid ${theme.colors.border}`,
          borderRadius: 0, boxShadow: theme.shadow.lg, display: 'none',
          flexDirection: 'column', padding: '16px 10px', justifyContent: 'space-between',
          transition: 'all 0.3s ease', zIndex: 40, overflow: 'visible',
          color: theme.colors.sidebarText, fontFamily: 'system-ui, sans-serif',
        }}
      >
        <style>{`
          @media (min-width: 900px) {
            .clf-sidebar { display: flex !important; }
            .clf-bottombar { display: none !important; }
          }
          .clf-sidebar-item:hover .clf-icon-wrap { transform: scale(1.1); }
          .clf-nav-scroll::-webkit-scrollbar { display: none; }
          .clf-nav-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>

        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <div style={{ position: 'relative', paddingBottom: 12, marginBottom: 12, borderBottom: `1px solid ${theme.colors.border}`, width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between' }}>
              <div style={{ width: 40, height: 40, background: theme.colors.sidebarActive, border: `1px solid ${theme.colors.accent}33`, borderRadius: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.colors.textLight, fontWeight: 900, fontSize: 25, flexShrink: 0 }}>
                {title ? title.charAt(0) : 'C'}
              </div>

              {!isCollapsed && (
                <button onClick={() => setIsCollapsed(true)} title="Collapse Sidebar" style={{ width: 28, height: 28, borderRadius: 0, background: 'transparent', border: `1px solid ${theme.colors.border}`, color: theme.colors.sidebarText, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.25s ease' }}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
                </button>
              )}
            </div>

            {!isCollapsed && (
              <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '0 2px' }}>
                <h1 style={{ margin: 0, fontSize: 12, fontWeight: 700, color: theme.colors.sidebarText, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</h1>
                {/*  Yahan ab Employee ka sahi naam dikhega */}
                <p style={{ margin: 0, fontSize: 10, color: theme.colors.muted, opacity: 0.9, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</p>
                <span style={{ width: 'max-content', marginTop: 4, fontSize: 8, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 800, background: `${theme.colors.accent}22`, color: theme.colors.accent, border: `1px solid ${theme.colors.accent}55`, padding: '2px 8px', borderRadius: 0 }}>
                  {user?.role?.replace('_', ' ')}
                </span>
              </div>
            )}

            {isCollapsed && (
              <button onClick={() => setIsCollapsed(false)} title="Expand Sidebar" style={{ width: 40, height: 24, background: 'transparent', border: `1px solid ${theme.colors.border}`, borderRadius: 0, color: theme.colors.sidebarText, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.8" viewBox="0 0 24 24" style={{ transform: 'rotate(180deg)' }}><path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7" /></svg>
              </button>
            )}
          </div>

          <nav className="clf-nav-scroll" style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: itemGap, width: '100%', overflowY: 'auto', maxHeight: 'calc(100vh - 280px)' }}>
            {activeIndex !== -1 && (
              <div style={{ position: 'absolute', left: isCollapsed ? '50%' : 0, width: isCollapsed ? 40 : '100%', height: itemHeight, background: theme.colors.sidebarActive, border: `1px solid ${theme.colors.accent}44`, borderRadius: 0, zIndex: 0, transform: `translateY(${activeIndex * (itemHeight + itemGap)}px) ${isCollapsed ? 'translateX(-50%)' : ''}`, transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.3s ease', pointerEvents: 'none' }} />
            )}

            {menu.map((item, idx) => {
              const isActive = activeIndex === idx;
              return (
                <div key={item.path} className="clf-sidebar-item" onMouseEnter={(event) => handleMouseEnter(event, item.label)} onMouseLeave={handleMouseLeave} style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
                  <NavLink
                    to={item.path}
                    style={{
                      position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', height: itemHeight,
                      borderRadius: 0, width: '100%', justifyContent: isCollapsed ? 'center' : 'flex-start',
                      padding: isCollapsed ? 0 : '0 12px', gap: isCollapsed ? 0 : 10, textDecoration: 'none',
                      color: isActive ? theme.colors.textLight : theme.colors.sidebarText,
                      fontWeight: isActive ? 700 : 500, fontSize: 12, transition: 'color 0.25s ease',
                      opacity: isActive ? 1 : 0.85,
                    }}
                  >
                    <span className="clf-icon-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.25s ease', transform: isActive ? 'scale(1.1)' : 'scale(1)' }}>
                      {renderDynamicIcon(item)}
                    </span>

                    {!isCollapsed && (
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 600 }}>{item.label}</span>
                    )}

                    {isActive && (
                      <span style={{ position: 'absolute', background: theme.colors.accent, borderRadius: 0, ...(isCollapsed ? { bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 16, height: 3 } : { right: 0, top: 0, bottom: 0, width: 3 }) }} />
                    )}
                  </NavLink>
                </div>
              );
            })}
          </nav>
        </div>

        <div className="clf-sidebar-item" onMouseEnter={(event) => handleMouseEnter(event, 'Logout')} onMouseLeave={handleMouseLeave} style={{ position: 'relative', paddingTop: 12, borderTop: `1px solid ${theme.colors.border}`, width: '100%', display: 'flex', justifyContent: 'center' }}>
          <button onClick={handleLogout} style={{ height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${theme.colors.danger}22`, color: theme.colors.danger, border: `1px solid ${theme.colors.danger}55`, borderRadius: 0, cursor: 'pointer', width: isCollapsed ? 40 : '100%', gap: isCollapsed ? 0 : 10, padding: isCollapsed ? 0 : '0 10px', transition: 'all 0.25s ease', fontSize: 12, fontWeight: 700 }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4m7 14l5-5-5-5m5 5H9" /></svg>
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {isCollapsed && activeTooltip.show && (
        <div
          style={{
            position: 'fixed', left: 72, top: activeTooltip.top, transform: 'translateY(-50%)',
            background: theme.colors.sidebarActive, color: activeTooltip.label === 'Logout' ? theme.colors.danger : theme.colors.textLight,
            fontSize: 12, fontWeight: 700, padding: '6px 12px', borderRadius: 0, boxShadow: theme.shadow.md,
            border: `1px solid ${activeTooltip.label === 'Logout' ? `${theme.colors.danger}66` : theme.colors.border}`,
            whiteSpace: 'nowrap', zIndex: 9999, pointerEvents: 'none',
          }}
        >
          {activeTooltip.label}
          <div
            style={{
              position: 'absolute', left: -4, top: '50%', transform: 'translateY(-50%) rotate(45deg)',
              width: 8, height: 8, background: theme.colors.sidebarActive,
              borderLeft: `1px solid ${activeTooltip.label === 'Logout' ? `${theme.colors.danger}66` : theme.colors.border}`,
              borderBottom: `1px solid ${activeTooltip.label === 'Logout' ? `${theme.colors.danger}66` : theme.colors.border}`,
            }}
          />
        </div>
      )}
    </>
  );
}