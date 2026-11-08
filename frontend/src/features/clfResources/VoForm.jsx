import { useState } from 'react';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import { theme } from '../../config/theme.js';

const EMPTY_MEMBER = { name: '', village: '', phone: '' };

const EMPTY = {
  voName: '',
  accountNumber: '',
  bankName: '',
  branch: '',        // 
  ifscCode: '',
  sachiv: { ...EMPTY_MEMBER },
  adhyaksh: { ...EMPTY_MEMBER },
  koshaAdhyaksh: { ...EMPTY_MEMBER },
};

export default function VoForm({ initial, onSave, onCancel, saving = false }) {
  const [form, setForm] = useState(initial ? {
    voName: initial.voName || '',
    accountNumber: initial.accountNumber || '',
    bankName: (initial.bankName || '').toUpperCase(),
    branch: (initial.branch || '').toUpperCase(),
    ifscCode: (initial.ifscCode || '').toUpperCase(),
    sachiv: {
      name: initial.sachiv?.name || '',
      village: initial.sachiv?.village || '',
      phone: initial.sachiv?.phone || '',
    },
    adhyaksh: {
      name: initial.adhyaksh?.name || '',
      village: initial.adhyaksh?.village || '',
      phone: initial.adhyaksh?.phone || '',
    },
    koshaAdhyaksh: {
      name: initial.koshaAdhyaksh?.name || '',
      village: initial.koshaAdhyaksh?.village || '',
      phone: initial.koshaAdhyaksh?.phone || '',
    },
  } : JSON.parse(JSON.stringify(EMPTY)));

  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    const upper = ['bankName', 'branch', 'ifscCode'];
    setForm((f) => ({ ...f, [name]: upper.includes(name) ? value.toUpperCase() : value }));
  };

  const handleMemberField = (role, field, value) => {
    setForm((f) => ({ ...f, [role]: { ...f[role], [field]: value } }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.voName.trim()) return setError('VO Name is required');

    if (form.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifscCode)) {
      return setError('Invalid IFSC code (e.g. SBIN0001234)');
    }

    try {
      await onSave(form);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    }
  };

  const renderMember = (role, label) => (
    <div style={{ padding: 12, background: theme.colors.background, borderRadius: 8, border: `1px solid ${theme.colors.border}`, marginBottom: 12 }}>
      <h5 style={{ margin: '0 0 10px', color: theme.colors.primary, fontSize: 13 }}>{label}</h5>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <Input label="Name" value={form[role].name} onChange={(e) => handleMemberField(role, 'name', e.target.value)} />
        <Input label="Village" value={form[role].village} onChange={(e) => handleMemberField(role, 'village', e.target.value)} />
        <Input label="Phone" value={form[role].phone} onChange={(e) => handleMemberField(role, 'phone', e.target.value)} />
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, maxHeight: '75vh', overflowY: 'auto', paddingRight: 6 }}>
      <Input label="VO Name" name="voName" value={form.voName} onChange={handleChange} required />

      <h4 style={{ margin: '8px 0 0', fontSize: 14, color: theme.colors.primary }}>VO Bank Details (optional)</h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Input label="Account Number" name="accountNumber" value={form.accountNumber} onChange={handleChange} />
        <Input label="Bank Name" name="bankName" value={form.bankName} onChange={handleChange} style={{ textTransform: 'uppercase' }} />
        <Input label="Branch" name="branch" value={form.branch} onChange={handleChange} style={{ textTransform: 'uppercase' }} /> {/*  */}
        <Input label="IFSC Code" name="ifscCode" value={form.ifscCode} onChange={handleChange} placeholder="SBIN0001234" style={{ textTransform: 'uppercase' }} />
      </div>

      {renderMember('sachiv', 'सचिव (Sachiv)')}
      {renderMember('adhyaksh', 'अध्यक्ष (Adhyaksh)')}
      {renderMember('koshaAdhyaksh', 'कोषाध्यक्ष (Kosha Adhyaksh)')}

      {error && <p style={{ color: theme.colors.danger, fontSize: 13, margin: 0 }}>{error}</p>}

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <Button variant="ghost" type="button" onClick={onCancel} disabled={saving}>Cancel</Button>
        <Button type="submit" loading={saving}>{initial ? 'Update' : 'Add'} VO</Button>
      </div>
    </form>
  );
}