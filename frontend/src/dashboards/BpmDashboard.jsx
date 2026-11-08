import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader.jsx';
import { theme } from '../config/theme.js';
import { getAuthUser } from '../utils/authStorage.js';
import * as api from '../features/clfs/clfs.api.js';

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening';
};

const Stat = ({ icon, label, value, color, to }) => {
  const inner = (
    <div
      style={{
        background: theme.colors.surface,
        borderRadius: theme.radius.md,
        padding: 16,
        boxShadow: theme.shadow.sm,
        border: `1px solid ${theme.colors.border}`,
        borderLeft: `4px solid ${color}`,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        textDecoration: 'none',
        color: theme.colors.text,
        transition: 'transform 0.15s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          background: `${color}15`,
          color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 20,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11, color: theme.colors.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.3 }}>
          {label}
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.1 }}>{value}</div>
      </div>
    </div>
  );
  return to ? <Link to={to} style={{ textDecoration: 'none' }}>{inner}</Link> : inner;
};

export default function BpmDashboard() {
  const user = getAuthUser() || {};
  const [data, setData] = useState({ totalCLFs: '...', totalEmployees: '...', todayActionPlans: '...' });

  useEffect(() => {
    api.bpmDashboard()
      .then(({ data }) => setData(data.data || {}))
      .catch(() => {});
  }, []);

  return (
    <>
      <PageHeader
        title={`${greeting()}, ${user.name || 'BPM Admin'} `}
        subtitle="Block overview — CLFs, employees & daily activity"
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        <Stat icon="" label="Total CLFs" value={data.totalCLFs} color={theme.colors.primary} to="/bpm/clfs" />
        <Stat icon="" label="Active Employees" value={data.totalEmployees} color={theme.colors.info} to="/bpm/employees" />
        <Stat icon="" label="Today's Action Plans" value={data.todayActionPlans} color={theme.colors.secondary} to="/bpm/work" />
      </div>
    </>
  );
}