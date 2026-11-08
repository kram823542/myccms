// features/system/CollectionEditor.jsx
import { useState } from 'react';
import Modal from '../../components/ui/Modal.jsx';
import Button from '../../components/ui/Button.jsx';
import { theme } from '../../config/theme.js';
import * as api from './system.api.js';
import toast from 'react-hot-toast';

export default function CollectionEditor({ collection, doc, onClose, onUpdated }) {
  const [jsonText, setJsonText] = useState(JSON.stringify(doc, null, 2));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setError('');
    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (err) {
      setError('Invalid JSON: ' + err.message);
      return;
    }
    delete parsed._id; // prevent _id change

    setSaving(true);
    try {
      await api.updateDoc(collection, doc._id?.value || doc._id, parsed);
      toast.success('Document updated');
      onUpdated?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title={`Edit ${collection}`} size="lg">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <p style={{ fontSize: 12, color: theme.colors.muted, margin: 0 }}>
          Edit the raw JSON. Sensitive fields are masked. _id cannot be changed.
        </p>

        <textarea
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          rows={20}
          spellCheck={false}
          style={{
            width: '100%',
            padding: 14,
            fontFamily: 'monospace',
            fontSize: 12,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: 8,
            background: theme.colors.background,
            color: theme.colors.text,
            outline: 'none',
            resize: 'vertical',
            lineHeight: 1.5,
          }}
        />

        {error && (
          <div style={{ padding: 10, background: `${theme.colors.danger}12`, color: theme.colors.danger, borderRadius: 8, fontSize: 12 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={saving}>
             Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  );
}