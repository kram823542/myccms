import { useCallback, useEffect, useRef, useState } from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import ResponsiveTable from '../../components/common/ResponsiveTable.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Loader from '../../components/ui/Loader.jsx';
import ClfForm from './ClfForm.jsx';
import ResetPasswordModal from '../../components/common/ResetPasswordModal.jsx';
import { theme } from '../../config/theme.js';
import { getAuthUser } from '../../utils/authStorage.js';
import toast from 'react-hot-toast';
import * as api from './clfs.api.js';

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
      <td style={{ padding: '12px 14px' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: theme.colors.primary, background: `${theme.colors.primary}10`, padding: '4px 8px', borderRadius: 6 }}>
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
          <button ref={buttonRef} onClick={handleOpenMenu} style={{ background: openMenu ? theme.colors.background : 'transparent', border: `1px solid ${theme.colors.border}`, borderRadius: '8px', width: 32, height: 32, cursor: 'pointer', color: theme.colors.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
          </button>
          {openMenu && (
            <div ref={menuRef} style={{ position: 'fixed', top: menuPos.top, left: menuPos.left, background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: '12px', boxShadow: theme.shadow.lg, minWidth: 180, zIndex: 9999, padding: '6px' }}>
              <MenuItem label="View Details" color={theme.colors.text} onClick={() => { setOpenMenu(false); onViewDetails?.(clf); }} />
              {canReset && (
                <MenuItem label="Reset Password" color={theme.colors.danger} onClick={() => { setOpenMenu(false); onReset?.(clf); }} />
              )}
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

function MenuItem({ label, color, onClick }) {
  return (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', padding: '10px 12px', background: 'transparent', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: 13, color, fontWeight: 600 }}>
      <span>{label}</span>
    </button>
  );
}

export default function ClfsPage() {
  const [clfs, setClfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const page = 1;
  const limit = 20;
  const [openForm, setOpenForm] = useState(false);
  const [tempCred, setTempCred] = useState(null);
  const [resetTarget, setResetTarget] = useState(null);
  const [, setViewTarget] = useState(null);

  const user = getAuthUser() || {};
  const canReset = ['BPM', 'SUPER_ADMIN'].includes(user.role);

  const load = useCallback(async () => {
    try {
      const { data } = await api.listClfs({ page, limit });
      setClfs(data.data.clfs || data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load CLFs');
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => { void Promise.resolve().then(load); }, [load]);

  const handleResetConfirm = async (data) => {
    const res = await api.resetClfPassword(resetTarget._id, data);
    load();
    return res.data.data;
  };

  return (
    <>
      <PageHeader title="CLFs" subtitle="Community Level Federations" actions={<Button onClick={() => setOpenForm(true)}>+ Create CLF</Button>} />

      {loading ? (
        <Loader />
      ) : clfs.length === 0 ? (
        <div style={{ padding: 40, background: theme.colors.surface, borderRadius: theme.radius.md, textAlign: 'center', color: theme.colors.muted }}>No CLFs found</div>
      ) : (
        <ResponsiveTable minWidth={800}>
          <thead>
            <tr style={{ background: theme.colors.background }}>
              <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 700, fontSize: 12, color: theme.colors.muted }}>Name</th>
              <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 700, fontSize: 12, color: theme.colors.muted }}>Login ID</th>
              <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 700, fontSize: 12, color: theme.colors.muted }}>Block</th>
              <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 700, fontSize: 12, color: theme.colors.muted }}>Village</th>
              <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 700, fontSize: 12, color: theme.colors.muted }}>President</th>
              <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 700, fontSize: 12, color: theme.colors.muted }}>Status</th>
              <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 700, fontSize: 12, color: theme.colors.muted }}>Actions</th>
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
        <div style={{ background: theme.colors.background, padding: 12, borderRadius: 8, fontSize: 14, color: theme.colors.text }}>
          <div><b>Username:</b> {tempCred?.username}</div>
          <div><b>Password:</b> {tempCred?.tempPassword}</div>
        </div>
      </Modal>

      <ResetPasswordModal
        key={`${!!resetTarget}:${resetTarget?.loginId || resetTarget?.code || ''}`}
        open={!!resetTarget}
        onClose={() => setResetTarget(null)}
        entityName={resetTarget?.name}
        entityLabel="CLF"
        currentUsername={resetTarget?.loginId || resetTarget?.code?.toLowerCase() || ''} 
        onConfirm={handleResetConfirm}
      />
    </>
  );
}