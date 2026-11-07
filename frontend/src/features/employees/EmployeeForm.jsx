import { useState, useEffect } from 'react';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import { theme } from '../../config/theme.js';
import * as api from './employees.api.js';

export default function EmployeeForm({ initialData, onCreated, onCancel }) {
  const [form, setForm] = useState({
    employeeCode: '',
    name: '',
    mobile: '',
    designation: '',
    joiningDate: '',
    aadhaarNumber: '',
    bankDetails: { bankName: '', accountNumber: '', branch: '', ifsc: '' },
    workLocation: { panchayat: '' },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState([]);

  // ✅ FIX: Edit mode me asli Aadhaar aur Account Number load karo
  useEffect(() => {
    if (initialData) {
      setForm({
        employeeCode: initialData.employeeCode || '',
        name: initialData.name || '',
        mobile: initialData.mobile || '',
        designation: initialData.designation || '',
        joiningDate: initialData.joiningDate ? initialData.joiningDate.split('T')[0] : '',
        // ✅ Asli Aadhaar load karo (masked nahi)
        aadhaarNumber: initialData.aadhaarNumber || '', 
        bankDetails: {
          bankName: initialData.bankDetails?.bankName || '',
          // ✅ Asli Account Number load karo (masked nahi)
          accountNumber: initialData.bankDetails?.accountNumber || '',
          branch: initialData.bankDetails?.branch || '',
          ifsc: initialData.bankDetails?.ifsc || '',
        },
        workLocation: { panchayat: initialData.workLocation?.panchayat || '' },
      });
    }
  }, [initialData]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const handleNested = (section) => (e) => setForm((f) => ({ ...f, [section]: { ...f[section], [e.target.name]: e.target.value } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors([]);
    setLoading(true);

    const payload = {
      name: form.name.trim(),
      mobile: form.mobile.trim(),
      designation: form.designation.trim(),
      joiningDate: form.joiningDate,
      workLocation: { panchayat: form.workLocation.panchayat.trim() },
    };

    if (form.aadhaarNumber && form.aadhaarNumber.trim()) payload.aadhaarNumber = form.aadhaarNumber.trim();
    
    const bank = form.bankDetails;
    if (bank.bankName.trim() || bank.accountNumber.trim() || bank.branch.trim() || bank.ifsc.trim()) {
      payload.bankDetails = {
        bankName: bank.bankName.trim(),
        branch: bank.branch.trim(),
        ifsc: bank.ifsc.trim().toUpperCase(),
      };
      if (bank.accountNumber && bank.accountNumber.trim()) payload.bankDetails.accountNumber = bank.accountNumber.trim();
    }

    try {
      if (initialData) {
        await api.updateEmployee(initialData._id, payload);
        onCreated?.();
      } else {
        payload.employeeCode = form.employeeCode.trim().toUpperCase();
        const { data } = await api.createEmployee(payload);
        onCreated?.(data.data.login);
      }
    } catch (err) {
      const res = err.response?.data;
      setError(res?.message || 'Failed to save');
      if (res?.errors) setFieldErrors(res.errors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {!initialData && (
        <Input label="Employee Code" name="employeeCode" value={form.employeeCode} onChange={handleChange} placeholder="EMP001" required />
      )}
      
      <Input label="Name" name="name" value={form.name} onChange={handleChange} required />
      <Input label="Mobile" name="mobile" value={form.mobile} onChange={handleChange} placeholder="9876543210" required />
      <Input label="Designation" name="designation" value={form.designation} onChange={handleChange} placeholder="Bank Sakhi" required />
      <Input label="Joining Date" name="joiningDate" type="date" value={form.joiningDate} onChange={handleChange} required />
      
      {/* ✅ Ab yahan asli Aadhaar dikhega */}
      <Input
        label="Aadhaar Number"
        name="aadhaarNumber"
        value={form.aadhaarNumber}
        onChange={handleChange}
        placeholder="12 digits"
      />

      <h4 style={{ margin: '8px 0 0', fontSize: 14 }}>Bank Details</h4>
      <Input label="Bank Name" name="bankName" value={form.bankDetails.bankName} onChange={handleNested('bankDetails')} />
      
      {/* ✅ Ab yahan asli Account Number dikhega */}
      <Input
        label="Account Number"
        name="accountNumber"
        value={form.bankDetails.accountNumber}
        onChange={handleNested('bankDetails')}
      />
      
      <Input label="Branch" name="branch" value={form.bankDetails.branch} onChange={handleNested('bankDetails')} />
      <Input label="IFSC" name="ifsc" value={form.bankDetails.ifsc} onChange={handleNested('bankDetails')} placeholder="SBIN0001234" />

      <h4 style={{ margin: '8px 0 0', fontSize: 14 }}>Work Location</h4>
      <Input label="Panchayat" name="panchayat" value={form.workLocation.panchayat} onChange={handleNested('workLocation')} required />

      {error && (
        <div style={{ padding: 10, background: theme.colors.dangerSurface, color: theme.colors.danger, borderRadius: 8, fontSize: 13 }}>
          <b>{error}</b>
          {fieldErrors.length > 0 && (
            <ul style={{ margin: '6px 0 0 16px', padding: 0 }}>
              {fieldErrors.map((fe, i) => <li key={i}><b>{fe.field}</b>: {fe.message}</li>)}
            </ul>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
        {onCancel && <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" loading={loading} style={{ flex: 1 }}>
          {initialData ? 'Update Details' : 'Create Employee'}
        </Button>
      </div>
    </form>
  );
}