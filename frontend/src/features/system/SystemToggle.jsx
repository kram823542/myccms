// features/system/SystemToggle.jsx
import { useState } from 'react';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { theme } from '../../config/theme.js';
import * as api from './system.api.js';
import toast from 'react-hot-toast';

export default function SystemToggle({ state, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [offlineMessage, setOfflineMessage] = useState(
    state?.offlineMessage || 'System is under maintenance. Please try again later.'
  );

  const targetOffline = !state?.isOffline;

  const handleToggle = async () => {
    setLoading(true);
    try {
      await api.toggleSystem(targetOffline, offlineMessage);
      toast.success(`System is now ${targetOffline ? 'OFFLINE ' : 'ONLINE '}`);
      onUpdate?.();
      setShowConfirm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        style={{
          background: theme.colors.surface,
          borderRadius: theme.radius.md,
          border: `1px solid ${theme.colors.border}`,
          boxShadow: theme.shadow.sm,
          padding: 24,
        }}
      >
        <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: theme.colors.text }}>
          {state?.isOffline ? ' System is OFFLINE' : ' System is ONLINE'}
        </h3>
        <p style={{ margin: '0 0 20px', fontSize: 13, color: theme.colors.muted, lineHeight: 1.6 }}>
          {state?.isOffline
            ? 'All users (except Super Admin) are blocked. Turn it back ON when maintenance is done.'
            : 'Turning OFF blocks all logins except Super Admin — useful for database maintenance, restore, or migration.'}
        </p>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: theme.colors.text, marginBottom: 6 }}>
            Maintenance Message (shown to blocked users)
          </label>
          <Input
            value={offlineMessage}
            onChange={(e) => setOfflineMessage(e.target.value)}
            placeholder="System is under maintenance..."
          />
        </div>

        <Button
          variant={targetOffline ? 'danger' : 'success'}
          onClick={() => setShowConfirm(true)}
          loading={loading}
        >
          {targetOffline ? ' Turn System OFF' : ' Turn System ON'}
        </Button>
      </div>

      <Modal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        title={targetOffline ? 'Turn System OFFLINE?' : 'Turn System ONLINE?'}
      >
        <p style={{ fontSize: 14, lineHeight: 1.6 }}>
          {targetOffline
            ? ' This will block ALL users (except you) from logging in or using the app. Continue?'
            : ' All users will regain access to the system. Continue?'}
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
          <Button variant="ghost" onClick={() => setShowConfirm(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant={targetOffline ? 'danger' : 'success'}
            onClick={handleToggle}
            loading={loading}
          >
            {targetOffline ? 'Turn OFF' : 'Turn ON'}
          </Button>
        </div>
      </Modal>
    </>
  );
}