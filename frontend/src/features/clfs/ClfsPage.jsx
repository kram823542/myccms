import { useEffect, useRef, useState } from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Loader from '../../components/ui/Loader.jsx'; // ✅ NEW: Loader import kiya
import ClfForm from './ClfForm.jsx';
import ResetPasswordModal from '../../components/common/ResetPasswordModal.jsx';
import { theme } from '../../config/theme.js';
import { getAuthUser } from '../../utils/authStorage.js';
import * as api from './clfs.api.js';

function ResponsiveTable({ children, minWidth = 720 }) {
  return (
    <div style={{ background: theme.colors.surface, borderRadius: theme.radius.md, boxShadow: theme.shadow.sm, width: '100%', maxWidth: '100%', overflowX: 'auto', overflowY: 'hidden', WebkitOverflowScrolling: 'touch' }} className="clf-table-wrap">
      <style>{`
        /* ✅ FIXED: Dynamic colors for scrollbar */
        .clf-table-wrap { scrollbar-width: thin; scrollbar-color: ${theme.colors.muted}40 transparent; }
        .clf-table-wrap::-webkit-scrollbar { height: 6px; }
        .clf-table-wrap::-webkit-scrollbar-track { background: transparent; }
        .clf-table-wrap::-webkit-scrollbar-thumb { background: ${theme.colors.muted}40; border-radius: 3px; }
        .clf-table { width: 100%; border-collapse: collapse; font-size: 14px; min-width: ${minWidth}px; }
        .clf-table th, .clf-table td { white-space: nowrap; }
      `}</style>
      <table className="clf-table">{children}</table>
    </div>
  );
}

function ClfRow({ clf, canReset, onReset, onViewDetails }) {
  const [openMenu, setOpenMenu] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) && buttonRef.current && !buttonRef.current.contains(e.target)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpenMenu = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPos({ top: rect.bottom + window.scrollY + 8, left: rect.left + window.scrollX - 160 });
    }
    setOpenMenu((v) => !v);
  };

  return (
    <tr style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
      <td style={{ padding: '12px 14px', fontWeight: 600, color: theme.colors.text }}>{clf.name}</td>
      
      {/* Login ID Column */}
      <td style={{ padding: '12px 14px' }}>
        <span style={{ 
          fontSize: 12, fontWeight: 700, color: theme.colors.primary, 
          background: `${theme.colors.primary}10`, padding: '4px 8px', borderRadius: 6 
        }}>
          {clf.loginId || clf.code?.toLowerCase()}
        </span>
      </td>

      <td style={{ padding: '12px 14px', color: theme.colors.muted }}>{clf.blockId?.name || '—'}</td>
      <td style={{ padding: '12px 14px', color: theme.colors.text }}>{clf.village || '—'}</td>
      <td style={{ padding: '12px 14px', color: theme.colors.text }}>{clf.coreMembers?.president?.name || clf.president || '—'}</td>
      <td style={{ padding: '12px 14px' }}>
        <Badge variant={clf.status === 'ACTIVE' ? 'success' : 'danger'}>{clf.status}</Badge>
      </td>
      <td style={{ padding: '12px 14px' }}>
        <div style={{ position: 'relative' }}>
          <button ref={buttonRef} onClick={handleOpenMenu} style={{ background: openMenu ? theme.colors.background : 'transparent', border: `1px solid ${theme.colors.border}`, borderRadius: '8px', width: 32, height: 32, cursor: 'pointer', color: theme.colors.text, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = theme.colors.background} onMouseLeave={(e) => !openMenu && (e.currentTarget.style.background = 'transparent')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
          </button>

          {openMenu && (
            <div ref={menuRef} style={{ position: 'fixed', top: menuPos.top, left: menuPos.left, background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: '12px', boxShadow: theme.shadow.lg, minWidth: 180, zIndex: 9999, overflow: 'hidden', padding: '6px' }}>
              <MenuItem icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>} label="View Details" color={theme.colors.text} onClick={() => { setOpenMenu(false); onViewDetails?.(clf); }} />

              {canReset && (
                <MenuItem icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>} label="Reset Password" color={theme.colors.danger} onClick={() => { setOpenMenu(false); onReset?.(clf); }} />
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
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', padding: '10px 12px', background: 'transparent', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: 13, color, fontWeight: 600, transition: 'background 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.background = theme.colors.background)} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.8 }}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

export default function ClfsPage() {
  const [clfs, setClfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [tempCred, setTempCred] = useState(null);
  const [resetTarget, setResetTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);

  const user = getAuthUser() || {};
  const canReset = ['BPM', 'SUPER_ADMIN'].includes(user.role);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.listClfs();
      setClfs(data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleResetConfirm = async (data) => {
    const res = await api.resetClfPassword(resetTarget._id, data);
    load();
    return res.data.data;
  };

  return (
    <>
      <PageHeader title="CLFs" subtitle="Community Level Federations" actions={<Button onClick={() => setOpenForm(true)}>+ Create CLF</Button>} />

      {loading ? (
        // ✅ FIXED: Raw text hatakar Loader component lagaya
        <Loader />
      ) : clfs.length === 0 ? (
        <div style={{ padding: 40, background: theme.colors.surface, borderRadius: theme.radius.md, textAlign: 'center', color: theme.colors.muted }}>No CLFs found</div>
      ) : (
        <ResponsiveTable minWidth={800}>
          <thead>
            <tr style={{ background: theme.colors.background }}>
              <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 700, fontSize: 12, color: theme.colors.muted, textTransform: 'uppercase' }}>Name</th>
              <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 700, fontSize: 12, color: theme.colors.muted, textTransform: 'uppercase' }}>Login ID</th>
              <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 700, fontSize: 12, color: theme.colors.muted, textTransform: 'uppercase' }}>Block</th>
              <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 700, fontSize: 12, color: theme.colors.muted, textTransform: 'uppercase' }}>Village</th>
              <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 700, fontSize: 12, color: theme.colors.muted, textTransform: 'uppercase' }}>President</th>
              <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 700, fontSize: 12, color: theme.colors.muted, textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 700, fontSize: 12, color: theme.colors.muted, textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {clfs.map((clf) => (
              <ClfRow key={clf._id} clf={clf} canReset={canReset} onReset={(clf) => setResetTarget(clf)} onViewDetails={(clf) => setViewTarget(clf)} />
            ))}
          </tbody>
        </ResponsiveTable>
      )}

      <Modal open={openForm} onClose={() => setOpenForm(false)} title="Create CLF">
        <ClfForm onCreated={(login) => { setTempCred(login); setOpenForm(false); load(); }} />
      </Modal>

      <Modal open={!!tempCred} onClose={() => setTempCred(null)} title="CLF Login Credentials">
        <p style={{ fontSize: 14, color: theme.colors.text }}>ये credentials सिर्फ एक बार दिखेंगे:</p>
        {/* ✅ FIXED: Hardcoded background color ko dynamic kiya */}
        <div style={{ background: theme.colors.background, padding: 12, borderRadius: 8, fontSize: 14, color: theme.colors.text }}>
          <div><b>Username:</b> {tempCred?.username}</div>
          <div><b>Password:</b> {tempCred?.tempPassword}</div>
        </div>
      </Modal>

      <ResetPasswordModal
        open={!!resetTarget}
        onClose={() => setResetTarget(null)}
        entityName={resetTarget?.name}
        entityLabel="CLF"
        currentUsername={resetTarget?.loginId || resetTarget?.code?.toLowerCase() || ''} 
        onConfirm={handleResetConfirm}
      />

      <Modal open={!!viewTarget} onClose={() => setViewTarget(null)} title="CLF Details">
        {viewTarget && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '70vh', overflowY: 'auto' }}>
            <div>
              <h4 style={{ margin: '0 0 10px', color: theme.colors.primary }}>Basic Info</h4>
              <InfoRow label="CLF Name" value={viewTarget.name} />
              <InfoRow label="Code" value={viewTarget.code} />
              <InfoRow label="Village" value={viewTarget.village} />
              <InfoRow label="Block" value={viewTarget.blockId?.name} />
              <InfoRow label="Status" value={<Badge variant={viewTarget.status === 'ACTIVE' ? 'success' : 'danger'}>{viewTarget.status}</Badge>} />
            </div>

            <div>
              <h4 style={{ margin: '0 0 10px', color: theme.colors.primary }}>Core Members</h4>
              <div style={{ background: theme.colors.background, padding: 10, borderRadius: 6, marginBottom: 8 }}>
                <p style={{ margin: '0 0 4px', fontWeight: 600, color: theme.colors.text }}>अध्यक्ष (President)</p>
                <p style={{ margin: 0, fontSize: 13, color: theme.colors.muted }}>Name: {viewTarget.coreMembers?.president?.name || viewTarget.president || '—'}</p>
                <p style={{ margin: 0, fontSize: 13, color: theme.colors.muted }}>Mobile: {viewTarget.coreMembers?.president?.mobile || '—'}</p>
              </div>
              <div style={{ background: theme.colors.background, padding: 10, borderRadius: 6, marginBottom: 8 }}>
                <p style={{ margin: '0 0 4px', fontWeight: 600, color: theme.colors.text }}>सचिव (Secretary)</p>
                <p style={{ margin: 0, fontSize: 13, color: theme.colors.muted }}>Name: {viewTarget.coreMembers?.secretary?.name || viewTarget.secretary || '—'}</p>
                <p style={{ margin: 0, fontSize: 13, color: theme.colors.muted }}>Mobile: {viewTarget.coreMembers?.secretary?.mobile || '—'}</p>
              </div>
              <div style={{ background: theme.colors.background, padding: 10, borderRadius: 6, marginBottom: 8 }}>
                <p style={{ margin: '0 0 4px', fontWeight: 600, color: theme.colors.text }}>कोषाध्यक्ष (Treasurer)</p>
                <p style={{ margin: 0, fontSize: 13, color: theme.colors.muted }}>Name: {viewTarget.coreMembers?.treasurer?.name || viewTarget.treasurer || '—'}</p>
                <p style={{ margin: 0, fontSize: 13, color: theme.colors.muted }}>Mobile: {viewTarget.coreMembers?.treasurer?.mobile || '—'}</p>
              </div>
            </div>

            <div>
              <h4 style={{ margin: '0 0 10px', color: theme.colors.primary }}>BOD Members</h4>
              {(!viewTarget.bodMembers || viewTarget.bodMembers.length === 0) ? (
                <p style={{ fontSize: 13, color: theme.colors.muted }}>No BOD members added.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {viewTarget.bodMembers.map((m, i) => (
                    <div key={i} style={{ padding: 10, background: theme.colors.background, borderRadius: 6, border: `1px solid ${theme.colors.border}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 600, color: theme.colors.text }}>{m.name}</span>
                        <span style={{ fontSize: 11, color: theme.colors.primary, fontWeight: 600 }}>{m.designation}</span>
                      </div>
                      <div style={{ fontSize: 12, color: theme.colors.muted }}>Mobile: {m.mobile || '—'}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 10, padding: '6px 0', borderBottom: `1px solid ${theme.colors.border}`, fontSize: 13 }}>
      <span style={{ color: theme.colors.muted, fontWeight: 600 }}>{label}</span>
      <span style={{ color: theme.colors.text, fontWeight: 500 }}>{value || '—'}</span>
    </div>
  );
}