// features/system/BackupDownload.jsx
import { useState } from 'react';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { theme } from '../../config/theme.js';
import * as api from './system.api.js';
import toast from 'react-hot-toast';

export default function BackupDownload({ state, onUpdate }) {
  const [downloading, setDownloading] = useState(false);
  const [wiping, setWiping] = useState(false);
  const [showWipe, setShowWipe] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const { data, headers } = await api.downloadBackup();

      //  Try to get backupId from response or generate filename
      const filename =
        headers['content-disposition']
          ?.match(/filename="?([^"]+)"?/)?.[1] ||
        `myccms-backup-${new Date().toISOString().split('T')[0]}.json`;

      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Backup downloaded ');
      onUpdate?.();
    } catch (err) {
      console.error(err);
      toast.error('Failed to download backup');
    } finally {
      setDownloading(false);
    }
  };

  const handleWipe = async () => {
    //  Guard: must have lastBackupId
    if (!state?.lastBackupId) {
      toast.error('Download a fresh backup first before wiping');
      return;
    }

    setWiping(true);
    try {
      const { data } = await api.wipeDatabase(state.lastBackupId);
      toast.success(`Database wiped — ${data.data.totalDeleted} documents deleted`);
      setShowWipe(false);
      onUpdate?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to wipe database');
    } finally {
      setWiping(false);
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
           Download Full Database Backup
        </h3>
        <p style={{ margin: '0 0 20px', fontSize: 13, color: theme.colors.muted, lineHeight: 1.6 }}>
          Creates a complete JSON snapshot of all collections. Save this file safely — you'll need it
          for restore and to unlock the "Wipe" button.
        </p>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Button onClick={handleDownload} loading={downloading}>
             Download Backup
          </Button>
          <Button
            variant="danger"
            onClick={() => setShowWipe(true)}
            disabled={!state?.lastBackupId}
          >
             Wipe Database
          </Button>
        </div>

        {state?.lastBackupId && (
          <div
            style={{
              marginTop: 16,
              padding: '10px 14px',
              background: theme.colors.background,
              borderRadius: 8,
              border: `1px solid ${theme.colors.border}`,
              fontSize: 12,
              fontFamily: 'monospace',
            }}
          >
            <strong>Last Backup ID:</strong> {state.lastBackupId}
          </div>
        )}
      </div>

      {/* Wipe Confirmation Modal */}
      <Modal
        open={showWipe}
        onClose={() => setShowWipe(false)}
        title=" Wipe Entire Database?"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0 }}>
            This will <strong style={{ color: theme.colors.danger }}>permanently delete</strong> all
            data from every collection (except Users, SystemState, BackupMetadata).
          </p>
          <div
            style={{
              padding: '10px 14px',
              background: `${theme.colors.danger}10`,
              border: `1px solid ${theme.colors.danger}40`,
              borderRadius: 8,
              fontSize: 13,
              color: theme.colors.danger,
              fontWeight: 600,
            }}
          >
             Guard: Backup ID must match your last download: <br />
            <code style={{ fontSize: 11, fontFamily: 'monospace' }}>{state?.lastBackupId || 'NO BACKUP DOWNLOADED'}</code>
          </div>
          <p style={{ fontSize: 13, color: theme.colors.muted, margin: 0 }}>
            Make sure you've downloaded the backup file to your device. This cannot be undone from
            the app.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
            <Button variant="ghost" onClick={() => setShowWipe(false)} disabled={wiping}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleWipe} loading={wiping}>
              Wipe All Data
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}