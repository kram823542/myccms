import { useState } from 'react';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import { theme } from '../../config/theme.js';
import * as api from './employees.api.js';

export default function EmployeeForm({ onCreated }) {
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

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleNested = (section) => (e) =>
    setForm((f) => ({
      ...f,
      [section]: { ...f[section], [e.target.name]: e.target.value },
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors([]);
    setLoading(true);

    // Build clean payload — remove empty optional fields
    const payload = {
      employeeCode: form.employeeCode.trim().toUpperCase(),
      name: form.name.trim(),
      mobile: form.mobile.trim(),
      designation: form.designation.trim(),
      joiningDate: form.joiningDate,
      workLocation: {
        panchayat: form.workLocation.panchayat.trim(),
      },
    };

    // Aadhaar only if provided
    if (form.aadhaarNumber.trim()) {
      payload.aadhaarNumber = form.aadhaarNumber.trim();
    }

    // Bank details only if any field has value
    const bank = form.bankDetails;
    const hasBankData = Object.values(bank).some((v) => v && v.trim());
    if (hasBankData) {
      payload.bankDetails = {};
      if (bank.bankName.trim()) payload.bankDetails.bankName = bank.bankName.trim();
      if (bank.accountNumber.trim())
        payload.bankDetails.accountNumber = bank.accountNumber.trim();
      if (bank.branch.trim()) payload.bankDetails.branch = bank.branch.trim();
      if (bank.ifsc.trim()) payload.bankDetails.ifsc = bank.ifsc.trim().toUpperCase();
    }

    console.log('📤 Sending payload:', payload);

    try {
      const { data } = await api.createEmployee(payload);
      onCreated?.(data.data.login);
    } catch (err) {
      console.error('❌ Create employee error:', err.response?.data);
      const res = err.response?.data;
      setError(res?.message || 'Failed to create employee');
      if (res?.errors) setFieldErrors(res.errors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Input
        label="Employee Code"
        name="employeeCode"
        value={form.employeeCode}
        onChange={handleChange}
        placeholder="EMP001"
        required
      />
      <Input label="Name" name="name" value={form.name} onChange={handleChange} required />
      <Input
        label="Mobile"
        name="mobile"
        value={form.mobile}
        onChange={handleChange}
        placeholder="9876543210"
        required
      />
      <Input
        label="Designation"
        name="designation"
        value={form.designation}
        onChange={handleChange}
        placeholder="Bank Sakhi"
        required
      />
      <Input
        label="Joining Date"
        name="joiningDate"
        type="date"
        value={form.joiningDate}
        onChange={handleChange}
        required
      />
      <Input
        label="Aadhaar Number (optional)"
        name="aadhaarNumber"
        value={form.aadhaarNumber}
        onChange={handleChange}
        placeholder="12 digits"
      />

      <h4 style={{ margin: '8px 0 0', fontSize: 14 }}>Bank Details (optional)</h4>
      <Input
        label="Bank Name"
        name="bankName"
        value={form.bankDetails.bankName}
        onChange={handleNested('bankDetails')}
      />
      <Input
        label="Account Number"
        name="accountNumber"
        value={form.bankDetails.accountNumber}
        onChange={handleNested('bankDetails')}
      />
      <Input
        label="Branch"
        name="branch"
        value={form.bankDetails.branch}
        onChange={handleNested('bankDetails')}
      />
      <Input
        label="IFSC"
        name="ifsc"
        value={form.bankDetails.ifsc}
        onChange={handleNested('bankDetails')}
        placeholder="SBIN0001234"
      />

      <h4 style={{ margin: '8px 0 0', fontSize: 14 }}>Work Location</h4>
      <Input
        label="Panchayat"
        name="panchayat"
        value={form.workLocation.panchayat}
        onChange={handleNested('workLocation')}
        required
      />

      {error && (
        <div
          style={{
            padding: 10,
            background: theme.colors.dangerSurface,
            color: theme.colors.danger,
            borderRadius: 8,
            fontSize: 13,
          }}
        >
          <b>{error}</b>
          {fieldErrors.length > 0 && (
            <ul style={{ margin: '6px 0 0 16px', padding: 0 }}>
              {fieldErrors.map((fe, i) => (
                <li key={i}>
                  <b>{fe.field}</b>: {fe.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <Button type="submit" loading={loading}>
        Create Employee
      </Button>
    </form>
  );
}