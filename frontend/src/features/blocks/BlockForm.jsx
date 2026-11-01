import { useState } from 'react';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import { theme } from '../../config/theme.js';
import * as api from './blocks.api.js';

export default function BlockForm({ onCreated }) {
  const [form, setForm] = useState({ name: '', code: '', district: '', state: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.createBlock(form);
      onCreated?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Input label="Name" name="name" value={form.name} onChange={handleChange} required />
      <Input label="Code" name="code" value={form.code} onChange={handleChange} required />
      <Input label="District" name="district" value={form.district} onChange={handleChange} />
      <Input label="State" name="state" value={form.state} onChange={handleChange} />
      {error && <p style={{ color: theme.colors.danger, fontSize: 13, margin: 0 }}>{error}</p>}
      <Button type="submit" loading={loading}>
        Create Block
      </Button>
    </form>
  );
}