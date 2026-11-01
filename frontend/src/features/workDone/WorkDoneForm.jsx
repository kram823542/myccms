import { useState } from 'react';
import Button from '../../components/ui/Button.jsx';
import ImageUpload from '../../components/common/ImageUpload.jsx';
import { theme } from '../../config/theme.js';
import * as api from './workDone.api.js';

export default function WorkDoneForm({ onSubmitted, onCancel }) {
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      setError('Image is required');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('description', description);
      fd.append('image', image);
      await api.submitWorkDone(fd);
      onSubmitted?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: theme.colors.surface,
        padding: 20,
        borderRadius: theme.radius.md,
        boxShadow: theme.shadow.sm,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      <label style={{ fontSize: 13, fontWeight: 600 }}>Work Done Description</label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={5}
        placeholder="आज मैंने ..."
        style={{
          padding: 12,
          borderRadius: theme.radius.md,
          border: `1px solid ${theme.colors.border}`,
          fontSize: 14,
          fontFamily: 'inherit',
          resize: 'vertical',
        }}
        required
      />
      <ImageUpload label="Work Photo" value={null} onChange={setImage} required />

      {error && <p style={{ color: theme.colors.danger, fontSize: 13, margin: 0 }}>{error}</p>}
      <div style={{ display: 'flex', gap: 10 }}>
        {onCancel && (
          <Button variant="ghost" type="button" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={loading}>
          Submit Work Done
        </Button>
      </div>
    </form>
  );
}