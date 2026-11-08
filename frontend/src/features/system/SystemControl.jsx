// features/system/SystemControl.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader.jsx';
import Loader from '../../components/ui/Loader.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { theme } from '../../config/theme.js';
import { getAuthUser } from '../../utils/authStorage.js';
import * as api from './system.api.js';
import SystemToggle from './SystemToggle.jsx';
import BackupDownload from './BackupDownload.jsx';
import BackupUpload from './BackupUpload.jsx';
import DatabaseBrowser from './DatabaseBrowser.jsx';
import toast from 'react-hot-toast';

export default function SystemControl() {
  const user = getAuthUser() || {};
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);

  //  Guard: only SUPER_ADMIN
  useEffect(() => {
    if (user.role !== 'SUPER_ADMIN') {
      toast.error('Access denied — Super Admin only');
      navigate('/login');
    }
  }, [user.role, navigate]);

  const loadState = async () => {
    setLoading(true);
    try {
      const { data } = await api.getSystemState();
      setState(data.data || null);
    } catch {
      toast.error('Failed to load system state');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(loadState);
  }, []);

  if (user.role !== 'SUPER_ADMIN') return null;
  if (loading) return <Loader />;

  const tabs = [
    { key: 'overview', label: ' Overview' },
    { key: 'backup', label: ' Backup' },
    { key: 'browse', label: ' Browse DB' },
  ];

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 16px', width: '100%', boxSizing: 'border-box' }}>
      <PageHeader
        title="System Control"
        subtitle="Full database backup, restore, wipe, and edit"
      />

      {/* State banner */}
      <div
        style={{
          padding: '12px 16px',
          borderRadius: theme.radius.md,
          background: state?.isOffline ? `${theme.colors.danger}15` : `${theme.colors.success}15`,
          border: `1px solid ${state?.isOffline ? theme.colors.danger : theme.colors.success}40`,
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>{state?.isOffline ? '' : ''}</span>
          <div>
            <div style={{ fontWeight: 700, color: theme.colors.text, fontSize: 14 }}>
              System {state?.isOffline ? 'OFFLINE' : 'ONLINE'}
            </div>
            <div style={{ fontSize: 12, color: theme.colors.muted }}>
              {state?.isOffline ? 'Users can\'t login — only SA can restore' : 'All users can access the app'}
            </div>
          </div>
        </div>
        {state?.lastBackupAt && (
          <Badge variant="info" showDot={false}>
            Last Backup: {new Date(state.lastBackupAt).toLocaleString()}
          </Badge>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'inline-flex', gap: 6, padding: 6, background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: 12, marginBottom: 20, boxShadow: theme.shadow.sm, flexWrap: 'wrap' }}>
        {tabs.map((t) => {
          const isActive = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                background: isActive ? theme.colors.primary : 'transparent',
                color: isActive ? theme.colors.textLight : theme.colors.muted,
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'overview' && (
        <SystemToggle state={state} onUpdate={loadState} />
      )}
      {tab === 'backup' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <BackupDownload state={state} onUpdate={loadState} />
          <BackupUpload state={state} onUpdate={loadState} />
        </div>
      )}
      {tab === 'browse' && <DatabaseBrowser />}
    </div>
  );
}