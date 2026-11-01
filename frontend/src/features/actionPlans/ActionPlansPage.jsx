import { useEffect, useState } from 'react';
import Table from '../../components/ui/Table.jsx';
import ActionPlanForm from './ActionPlanForm.jsx';
import { theme } from '../../config/theme.js';
import { getAuthUser } from '../../utils/authStorage.js';
import * as actionApi from './actionPlans.api.js';

export default function ActionPlansPage() {
  const user = getAuthUser() || {};
  const isEmployee = user.role === 'EMPLOYEE';
  const isBPM = user.role === 'BPM'; // ✅ NAYA: BPM check

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(!isEmployee);
  const [todayPlan, setTodayPlan] = useState(null);
  const [history, setHistory] = useState([]);
  const [showForm, setShowForm] = useState(false);

  /* ─── Load data ─── */
  const load = async () => {
    if (isEmployee) {
      try {
        const todayRes = await actionApi
          .todayActionPlan()
          .catch(() => ({ data: { data: null } }));
        setTodayPlan(todayRes.data.data);

        const histRes = await actionApi.listActionPlans({});
        setHistory(histRes.data.data.actionPlans || []);
      } catch (err) {
        console.error('Action plan load error:', err);
      } finally {
        setLoading(false);
      }
    } else {
      try {
        const { data } = await actionApi.listActionPlans({});
        setPlans(data.data.actionPlans || []);
      } catch (err) {
        console.error('Load plans error:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    load();
  }, [isEmployee]);

  /* ═══════════ EMPLOYEE VIEW ═══════════ */
  if (isEmployee) {
    if (showForm) {
      return (
        <ActionPlanForm
          onSubmitted={() => {
            setShowForm(false);
            load();
          }}
        />
      );
    }

    if (loading) {
      return (
        <div style={{ padding: 40, textAlign: 'center', color: theme.colors.muted }}>
          Loading...
        </div>
      );
    }

    return (
      <>
        {todayPlan ? (
          <div
            style={{
              background: theme.colors.surface,
              padding: 20,
              borderRadius: theme.radius.md,
              boxShadow: theme.shadow.sm,
              marginBottom: 20,
              borderLeft: `4px solid ${theme.colors.success}`,
            }}
          >
            <h3 style={{ marginTop: 0, color: theme.colors.primary }}>
              ✅ Today's Action Plan Submitted
            </h3>
            <p style={{ whiteSpace: 'pre-line', fontSize: 14, marginBottom: 8 }}>
              {todayPlan.plan}
            </p>
            <p style={{ fontSize: 12, color: theme.colors.muted, marginBottom: 0 }}>
              Submitted: {new Date(todayPlan.submittedAt).toLocaleString()}
            </p>
          </div>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            style={{
              padding: '12px 24px',
              background: theme.colors.primary,
              color: theme.colors.textLight,
              border: 'none',
              borderRadius: 999,
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              marginBottom: 20,
              boxShadow: theme.shadow.md,
              transition: 'all 0.25s ease',
            }}
          >
            + Submit Today's Action Plan
          </button>
        )}

        <h3 style={{ marginTop: 8, marginBottom: 12, fontSize: 15, fontWeight: 700, color: theme.colors.text }}>
          📋 My Action Plan History ({history.length})
        </h3>

        <Table
          columns={[
            { header: 'Date', key: 'date' },
            {
              header: 'Action Plan',
              render: (r) => (
                <div style={{ maxWidth: 600, whiteSpace: 'pre-line' }}>
                  {r.plan}
                </div>
              ),
            },
            {
              header: 'Submitted At',
              render: (r) =>
                r.submittedAt
                  ? new Date(r.submittedAt).toLocaleString()
                  : '—',
            },
          ]}
          data={history}
          loading={loading}
          emptyMessage="अभी तक कोई Action Plan submit नहीं किया।"
        />
      </>
    );
  }

  /* ═══════════ ADMIN (BPM/CLF) VIEW ═══════════ */
  
  // ✅ Base Columns (Sabke liye)
  const columns = [
    { header: 'Employee', render: (r) => r.employeeId?.name || '—' },
    { header: 'Code', render: (r) => r.employeeId?.employeeCode || '—' },
    { header: 'Date', key: 'date' },
    { header: 'Plan', render: (r) => <div style={{ maxWidth: 500 }}>{r.plan}</div> },
  ];

  // ✅ NAYA: Agar BPM hai, toh "Date" ke pehle "CLF" ka column add karo
  if (isBPM) {
    columns.splice(2, 0, {
      header: 'CLF',
      render: (r) => (
        <span style={{ 
          fontSize: 11, 
          fontWeight: 700, 
          color: theme.colors.primary,
          background: `${theme.colors.primary}10`,
          padding: '4px 8px',
          borderRadius: 6,
          display: 'inline-block',
          whiteSpace: 'nowrap'
        }}>
          {r.clfId?.name || r.employeeId?.clfId?.name || '—'}
        </span>
      )
    });
  }

  return <Table columns={columns} data={plans} loading={loading} />;
}