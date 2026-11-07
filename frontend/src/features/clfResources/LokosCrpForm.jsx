import { useState } from 'react';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import { theme } from '../../config/theme.js';

const EMPTY = {
  name: '',
  village: '',
  designation: '',
  mobile: '',
  accountNumber: '',
  bankName: '',
  branch: '',       // ✅ branch
  ifscCode: '',
};

export default function LokosCrpForm({ initial, onSave, onCancel, saving = false }) {
  const [form, setForm] = useState(initial ? {
    name: initial.name || '',
    village: initial.village || '',
    designation: (initial.designation || '').toUpperCase(),
    mobile: initial.mobile || '',
    accountNumber: initial.accountNumber || '',
    bankName: (initial.bankName || '').toUpperCase(),
    branch: (initial.branch || '').toUpperCase(),
    ifscCode: (initial.ifscCode || '').toUpperCase(),
  } : { ...EMPTY });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    // ✅ Auto Uppercase for specific fields
    const upper = ['designation', 'bankName', 'branch', 'ifscCode'];
    setForm((f) => ({
      ...f,
      [name]: upper.includes(name) ? value.toUpperCase() : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) return setError('Name is required');
    if (!form.village.trim()) return setError('Village is required');
    if (!form.mobile.trim()) return setError('Mobile is required');

    // ✅ IFSC optional but agar diya hai to validate karo
    if (form.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifscCode)) {
      return setError('Invalid IFSC code (e.g. SBIN0001234)');
    }

    try {
      await onSave(form);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Input label="Name" name="name" value={form.name} onChange={handleChange} required />
      <Input label="Village" name="village" value={form.village} onChange={handleChange} required />
      <Input label="Designation" name="designation" value={form.designation} onChange={handleChange} placeholder="e.g. CRP / LOKOS" />
      <Input label="Mobile Number" name="mobile" value={form.mobile} onChange={handleChange} placeholder="9876543210" required />

      <h4 style={{ margin: '8px 0 0', fontSize: 14, color: theme.colors.primary }}>Bank Details (optional)</h4>
      <Input label="Account Number" name="accountNumber" value={form.accountNumber} onChange={handleChange} />
      <Input label="Bank Name" name="bankName" value={form.bankName} onChange={handleChange} style={{ textTransform: 'uppercase' }} />
      <Input label="Branch" name="branch" value={form.branch} onChange={handleChange} style={{ textTransform: 'uppercase' }} /> {/* ✅ branch */}
      <Input label="IFSC Code" name="ifscCode" value={form.ifscCode} onChange={handleChange} placeholder="SBIN0001234" style={{ textTransform: 'uppercase' }} />

      {error && <p style={{ color: theme.colors.danger, fontSize: 13, margin: 0 }}>{error}</p>}

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <Button variant="ghost" type="button" onClick={onCancel} disabled={saving}>Cancel</Button>
        <Button type="submit" loading={saving}>{initial ? 'Update' : 'Add'} Lokos CRP</Button>
      </div>
    </form>
  );
}