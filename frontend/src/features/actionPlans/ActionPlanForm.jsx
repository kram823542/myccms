import { useState } from 'react';
import Button from '../../components/ui/Button.jsx';
import { theme } from '../../config/theme.js';
import * as api from './actionPlans.api.js';

export default function ActionPlanForm({ onSubmitted }) {
  const [plan, setPlan] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.submitActionPlan({ plan });
      onSubmitted?.(data.data);
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
      <label style={{ fontSize: 13, fontWeight: 600 }}>Today's Action Plan</label>
      <textarea
        value={plan}
        onChange={(e) => setPlan(e.target.value)}
        rows={6}
        placeholder="1. VO meeting&#10;2. SHG verification&#10;3. Documentation"
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
      {error && <p style={{ color: theme.colors.danger, fontSize: 13, margin: 0 }}>{error}</p>}
      <Button type="submit" loading={loading}>
        Submit Action Plan
      </Button>
    </form>
  );
}