// features/system/BackupUpload.jsx
import { useRef, useState } from 'react';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { theme } from '../../config/theme.js';
import * as api from './system.api.js';
import toast from 'react-hot-toast';

export default function BackupUpload({ onUpdate }) {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [restoring, setRestoring] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleFileChange = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.name.endsWith('.json')) {
      toast.error('Only .json files accepted');
      return;
    }
    if (f.size > 200 * 1024 * 1024) {
      toast.error('File too large (max 200MB)');
      return;
    }

    try {
      const text = await f.text();
      const json = JSON.parse(text);
      if (!json.collections) {
        toast.error('Invalid backup file — missing "collections"');
        return;
      }
      const totalDocs = Object.values(json.collections).reduce((s, arr) => s + (Array.isArray(arr) ? arr.length : 0), 0);
      setFile(f);
      setPreview({
        backupId: json.backupId || 'unknown',
        createdAt: json.createdAt || 'unknown',
        collections: Object.keys(json.collections),
        totalDocs,
        json,
      });
      toast.success(`Backup loaded — ${totalDocs} documents across ${Object.keys(json.collections).length} collections`);
    } catch {
      toast.error('Invalid JSON file');
    }
  };

  const handleRestore = async () => {
    if (!preview?.json) return;
    setRestoring(true);
    try {
      const { data } = await api.restoreDatabase(preview.json);
      const result = data.data;
      if (result.success) {
        toast.success(` Restored ${result.totalRestored} documents`);
      } else {
        toast.error(`Partial restore — ${result.errors.length} collection(s) failed`);
      }
      setShowConfirm(false);
      setFile(null);
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      onUpdate?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Restore failed');
    } finally {
      setRestoring(false);
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
           Restore From Backup
        </h3>
        <p style={{ margin: '0 0 20px', fontSize: 13, color: theme.colors.muted, lineHeight: 1.6 }}>
          Upload a previously downloaded JSON backup. Each collection in the file will be{' '}
          <strong>replaced entirely</strong> with the backup contents.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        {!preview ? (
          <Button onClick={() => fileInputRef.current?.click()}>
             Select Backup File
          </Button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div
              style={{
                padding: 14,
                background: theme.colors.background,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: 8,
                fontSize: 13,
              }}
            >
              <div><strong>File:</strong> {file?.name}</div>
              <div style={{ marginTop: 4 }}><strong>Backup ID:</strong> <code style={{ fontFamily: 'monospace' }}>{preview.backupId}</code></div>
              <div style={{ marginTop: 4 }}><strong>Created:</strong> {preview.createdAt}</div>
              <div style={{ marginTop: 4 }}><strong>Collections:</strong> {preview.collections.length}</div>
              <div style={{ marginTop: 4 }}><strong>Total Docs:</strong> {preview.totalDocs}</div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="danger" onClick={() => setShowConfirm(true)}>
                 Restore Now
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      <Modal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        title=" Restore Database?"
      >
        <p style={{ fontSize: 14, lineHeight: 1.6 }}>
          This will <strong style={{ color: theme.colors.danger }}>overwrite</strong> all existing
          data in matching collections. Users, SystemState, and BackupMetadata are protected and
          won't be touched.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
          <Button variant="ghost" onClick={() => setShowConfirm(false)} disabled={restoring}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleRestore} loading={restoring}>
            Yes, Restore
          </Button>
        </div>
      </Modal>
    </>
  );
}