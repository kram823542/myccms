import { useEffect, useState } from 'react';
import Input from '../../components/ui/Input.jsx';
import Select from '../../components/ui/Select.jsx';
import Button from '../../components/ui/Button.jsx';
import { listBlocks } from '../blocks/blocks.api.js';
import * as api from './users.api.js';
import { theme } from '../../config/theme.js';

export default function UserForm({ onCreated }) {
  const [form, setForm] = useState({
    username: '',
    name: '',
    email: '',
    mobile: '',
    blockId: '',
  });
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    listBlocks().then(({ data }) => {
      setBlocks((data.data || []).map((b) => ({ value: b._id, label: `${b.name} (${b.code})` })));
    });
  }, []);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // ✅ DEBUGGING: Check karein ki kya data ja raha hai
    console.log("📤 Sending Data to Backend:", form);

    setLoading(true);
    try {
      const { data } = await api.createBPM(form);
      onCreated?.(data.data.tempPassword);
    } catch (err) {
      console.error("❌ Backend Error:", err.response?.data);
      setError(err.response?.data?.message || 'Failed to create BPM');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Input label="Username" name="username" value={form.username} onChange={handleChange} required />
      <Input label="Name" name="name" value={form.name} onChange={handleChange} required />
      <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
      <Input label="Mobile" name="mobile" value={form.mobile} onChange={handleChange} />
      <Select
        label="Block"
        name="blockId"
        value={form.blockId}
        onChange={handleChange}
        options={blocks}
        required
      />
      {error && <p style={{ color: theme.colors.danger, fontSize: 13, margin: 0 }}>{error}</p>}
      <Button type="submit" loading={loading}>
        Create BPM
      </Button>
    </form>
  );
}