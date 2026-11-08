import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader.jsx';
import { theme } from '../config/theme.js';
import { getAuthUser } from '../utils/authStorage.js';
import apiClient from '../services/apiClient.js';

const StatCard = ({ label, value, color, to, icon, loading }) => {
  const inner = (
    <div
      style={{
        background: theme.colors.surface,
        borderRadius: theme.radius.md,
        padding: 20,
        boxShadow: theme.shadow.sm,
        borderLeft: `4px solid ${color}`,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        textDecoration: 'none',
        color: theme.colors.text,
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        cursor: to ? 'pointer' : 'default',
      }}
      onMouseEnter={(e) => {
        if (to) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = theme.shadow.md;
        }
      }}
      onMouseLeave={(e) => {
        if (to) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = theme.shadow.sm;
        }
      }}
    >
      {icon && (
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: 12,
            background: `${color}15`,
            color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      )}
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontSize: 11,
            color: theme.colors.muted,
            marginBottom: 4,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: 0.3,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: 24,
            fontWeight: 800,
            color: theme.colors.text,
            lineHeight: 1.1,
          }}
        >
          {loading ? (
            <span
              style={{
                display: 'inline-block',
                width: 32,
                height: 20,
                background: theme.colors.border,
                borderRadius: 4,
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
          ) : (
            value
          )}
        </div>
      </div>
    </div>
  );

  return to ? (
    <Link to={to} style={{ textDecoration: 'none' }}>
      {inner}
    </Link>
  ) : (
    inner
  );
};

export default function SuperAdminDashboard() {
  const user = getAuthUser() || {};
  const [stats, setStats] = useState({
    totalBlocks: 0,
    totalBPMs: 0,
    totalUsers: 0,
    totalAuditEvents: 0,
    totalCLFs: 0,
    totalEmployees: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      setError('');

      const safeFetch = async (fn, fallback = null) => {
        try {
          return await fn();
        } catch (err) {
          console.warn('Stat fetch failed:', err?.message);
          return fallback;
        }
      };

      const [blocksRes, bpmsRes, usersRes, auditRes, clfsRes, employeesRes] =
        await Promise.all([
          safeFetch(() => apiClient.get('/blocks'), { data: { data: [] } }),
          safeFetch(
            () => apiClient.get('/users', { params: { role: 'BPM', limit: 1 } }),
            { data: { data: { pagination: { total: 0 } } } }
          ),
          safeFetch(
            () => apiClient.get('/users', { params: { limit: 1 } }),
            { data: { data: { pagination: { total: 0 } } } }
          ),
          safeFetch(
            () => apiClient.get('/audit-logs', { params: { limit: 1 } }),
            { data: { data: { pagination: { total: 0 } } } }
          ),
          safeFetch(() => apiClient.get('/clfs'), { data: { data: [] } }),
          safeFetch(
            () => apiClient.get('/employees', { params: { limit: 1 } }),
            { data: { data: { pagination: { total: 0 } } } }
          ),
        ]);

      const blocks = Array.isArray(blocksRes?.data?.data) ? blocksRes.data.data.length : 0;
      const bpms = bpmsRes?.data?.data?.pagination?.total ?? 0;
      const users = usersRes?.data?.data?.pagination?.total ?? 0;
      const auditEvents = auditRes?.data?.data?.pagination?.total ?? 0;
      const clfs = Array.isArray(clfsRes?.data?.data) ? clfsRes.data.data.length : 0;
      const employees = employeesRes?.data?.data?.pagination?.total ?? 0;

      setStats({
        totalBlocks: blocks,
        totalBPMs: bpms,
        totalUsers: users,
        totalAuditEvents: auditEvents,
        totalCLFs: clfs,
        totalEmployees: employees,
      });

      if (
        blocks === 0 &&
        bpms === 0 &&
        users === 0 &&
        auditEvents === 0 &&
        clfs === 0 &&
        employees === 0
      ) {
        setError(
          'Could not fetch dashboard data. Please check backend connection or refresh.'
        );
      }

      setLoading(false);
    };

    loadStats();
  }, []);

  const s = stats;
  const [greet] = useState(() => {
    const h = new Date().getHours();
    return h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening';
  });

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      <PageHeader
        title={`${greet}, ${user.name || 'Super Admin'} `}
        subtitle="Complete system overview — blocks, users, CLFs & activity"
      />

      {error && (
        <div
          style={{
            padding: '12px 16px',
            background: `${theme.colors.danger}12`,
            border: `1px solid ${theme.colors.danger}40`,
            color: theme.colors.danger,
            borderRadius: theme.radius.md,
            marginBottom: 20,
            fontSize: 13,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span></span>
          <span>{error}</span>
        </div>
      )}

      {/* Primary Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <StatCard
          icon=""
          label="Total Blocks"
          value={s.totalBlocks}
          color={theme.colors.primary}
          to="/super-admin/blocks"
          loading={loading}
        />
        <StatCard
          icon=""
          label="Total BPMs"
          value={s.totalBPMs}
          color={theme.colors.info}
          to="/super-admin/users"
          loading={loading}
        />
        <StatCard
          icon=""
          label="Total Users"
          value={s.totalUsers}
          color={theme.colors.success}
          to="/super-admin/users"
          loading={loading}
        />
        <StatCard
          icon=""
          label="Audit Events"
          value={s.totalAuditEvents}
          color={theme.colors.accent}
          to="/super-admin/audit-logs"
          loading={loading}
        />
      </div>

      {/* Secondary Stats */}
      <h3
        style={{
          margin: '0 0 12px',
          fontSize: 13,
          fontWeight: 700,
          color: theme.colors.muted,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}
      >
        System Health
      </h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <StatCard
          icon=""
          label="Total CLFs"
          value={s.totalCLFs}
          color={theme.colors.secondary}
          to="/super-admin/reports"
          loading={loading}
        />
        <StatCard
          icon=""
          label="Total Employees"
          value={s.totalEmployees}
          color={theme.colors.warning}
          to="/super-admin/reports"
          loading={loading}
        />
      </div>

      {/* Quick Actions */}
      <div
        style={{
          background: theme.colors.surface,
          borderRadius: theme.radius.md,
          border: `1px solid ${theme.colors.border}`,
          boxShadow: theme.shadow.sm,
          padding: 20,
          marginTop: 12,
        }}
      >
        <h3
          style={{
            margin: '0 0 12px',
            fontSize: 13,
            fontWeight: 700,
            color: theme.colors.primary,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          Quick Actions
        </h3>
        <p style={{ margin: 0, fontSize: 13, color: theme.colors.muted, lineHeight: 1.6 }}>
          Use the sidebar to manage <b>Blocks</b>, <b>BPM admins</b>, and view <b>Audit logs</b>.
          You can also download <b>Reports</b> for any employee across all blocks.
        </p>
      </div>
    </>
  );
}