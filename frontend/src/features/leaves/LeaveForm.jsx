import { useState } from 'react';
import { theme } from '../../config/theme.js';
import Input from '../../components/ui/Input.jsx';
import Select from '../../components/ui/Select.jsx';
import Button from '../../components/ui/Button.jsx';

const LEAVE_TYPES = [
  { value: 'Casual Leave', label: 'Casual Leave' },
  { value: 'Medical Leave', label: 'Medical Leave' },
  { value: 'Half Day', label: 'Half Day' },
  { value: 'Emergency Leave', label: 'Emergency Leave' },
  { value: 'Training', label: 'Training (प्रशिक्षण)' },
  { value: 'Other', label: 'Other' },
];

export default function LeaveForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState({
    leaveType: 'Casual Leave',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    reason: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      if (name === 'leaveType' && value === 'Half Day') {
        newData.endDate = newData.startDate;
      }
      return newData;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      startTime: formData.leaveType === 'Half Day' ? formData.startTime : undefined,
      endTime: formData.leaveType === 'Half Day' ? formData.endTime : undefined,
    };
    
    if (formData.leaveType === 'Half Day') {
      payload.endDate = formData.startDate;
    }

    onSubmit(payload, () => {
      setFormData({ leaveType: 'Casual Leave', startDate: '', endDate: '', startTime: '', endTime: '', reason: '' });
    });
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      // ✅ Responsive Padding: Mobile pe kam, Desktop pe zyada
      style={{ background: theme.colors.surface, padding: 'clamp(16px, 4vw, 24px)', borderRadius: theme.radius.md, boxShadow: theme.shadow.sm, border: `1px solid ${theme.colors.border}` }} 
      className="space-y-4 w-full"
    >
      <h2 style={{ color: theme.colors.text, borderBottom: `1px solid ${theme.colors.border}`, paddingBottom: '12px', marginBottom: '16px' }} className="text-base md:text-lg font-semibold">Apply for Leave</h2>
      
      <Select label="Leave Type" name="leaveType" value={formData.leaveType} onChange={handleChange} options={LEAVE_TYPES} required />
      
      {/* ✅ Mobile pe single column, Desktop pe 2 column */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Start Date" type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
        <Input label="End Date" type="date" name="endDate" value={formData.endDate} onChange={handleChange} min={formData.startDate} disabled={formData.leaveType === 'Half Day'} required />
      </div>

      {formData.leaveType === 'Half Day' && (
        <div style={{ background: `${theme.colors.info}10`, padding: '12px', borderRadius: theme.radius.sm, border: `1px solid ${theme.colors.info}30` }} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Start Time" type="time" name="startTime" value={formData.startTime} onChange={handleChange} required />
          <Input label="End Time" type="time" name="endTime" value={formData.endTime} onChange={handleChange} required />
        </div>
      )}

      <div>
        <label style={{ color: theme.colors.text, fontSize: 13, fontWeight: 600, paddingLeft: 14, display: 'block', marginBottom: 6 }}>Reason</label>
        <textarea 
          name="reason" 
          value={formData.reason} 
          onChange={handleChange} 
          rows="3" 
          placeholder="Briefly explain why you need this leave..." 
          required
          style={{ width: '100%', padding: '13px 20px', border: `1.5px solid ${theme.colors.border}`, borderRadius: '12px', fontSize: '14px', color: theme.colors.text, outline: 'none', background: theme.colors.surface, resize: 'vertical' }}
        ></textarea>
      </div>

      <Button type="submit" loading={loading} style={{ width: '100%' }}>Apply Leave</Button>
    </form>
  );
}