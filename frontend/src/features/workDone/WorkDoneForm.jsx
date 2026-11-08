import { useState } from 'react';
import Button from '../../components/ui/Button.jsx';
import ImageUpload from '../../components/common/ImageUpload.jsx';
import { theme } from '../../config/theme.js';
import * as api from './workDone.api.js';

export default function WorkDoneForm({ initialData, onSubmitted, onCancel }) {
  const [description, setDescription] = useState(() => initialData?.description || '');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Description is required');
      return;
    }
    //  Image ab optional hai, force nahi kar rahe
    setError('');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('description', description);
      if (image) {
        fd.append('image', image);
      }
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: 16, color: theme.colors.primary }}>
          {initialData ? ' Re-submit Work Done' : 'Submit Work Done'}
        </h3>
        {initialData?.rejectionReason && (
          <div style={{ fontSize: 12, color: theme.colors.danger, background: `${theme.colors.danger}10`, padding: '4px 10px', borderRadius: 6 }}>
            <b>Rejected:</b> {initialData.rejectionReason}
          </div>
        )}
      </div>

      <label style={{ fontSize: 13, fontWeight: 600 }}>Work Done Description *</label>
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
      
      <div>
        <ImageUpload label="Work Photo (Optional)" value={initialData?.imageUrl} onChange={setImage} />
        {!image && !initialData?.imageUrl && (
          <p style={{ fontSize: 11, color: theme.colors.muted, marginTop: 4 }}>Image is optional</p>
        )}
      </div>

      {error && <p style={{ color: theme.colors.danger, fontSize: 13, margin: 0 }}>{error}</p>}
      
      <div style={{ display: 'flex', gap: 10 }}>
        {onCancel && (
          <Button variant="ghost" type="button" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={loading}>
          {initialData ? 'Re-submit' : 'Submit Work Done'}
        </Button>
      </div>
    </form>
  );
}