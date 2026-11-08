import { useCallback, useEffect, useState } from 'react';
import Table from '../../components/ui/Table.jsx';
import ActionPlanForm from './ActionPlanForm.jsx';
import { theme } from '../../config/theme.js';
import { getAuthUser } from '../../utils/authStorage.js';
import * as actionApi from './actionPlans.api.js';
import toast from 'react-hot-toast';
import { useSubmissionWindows } from '../../hooks/useSubmissionWindows.js';
import { formatSubmissionWindow } from '../../utils/submissionWindow.js';

export default function ActionPlansPage() {
  const user = getAuthUser() || {};
  const isEmployee = user.role === 'EMPLOYEE';
  const isBPM = user.role === 'BPM';

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayPlan, setTodayPlan] = useState(null);
  const [history, setHistory] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loadError, setLoadError] = useState('');
  const { windows, error: windowError } = useSubmissionWindows();
  const actionPlanWindow = windows?.actionPlan;
  const isWindowOpen = actionPlanWindow?.isOpen === true;
  const formattedWindow = formatSubmissionWindow(actionPlanWindow);

  /* ─── Load data ─── */
  const load = useCallback(async () => {
    setLoadError('');
    if (isEmployee) {
      try {
        const todayRes = await actionApi.todayActionPlan();
        setTodayPlan(todayRes.data.data);

        const histRes = await actionApi.listActionPlans({});
        setHistory(histRes.data.data.actionPlans || []);
      } catch (err) {
        console.error('Action plan load error:', err);
        setLoadError(err.response?.data?.message || 'Action plans could not be loaded. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      try {
        const { data } = await actionApi.listActionPlans({});
        setPlans(data.data.actionPlans || []);
      } catch (err) {
        console.error('Load plans error:', err);
        setLoadError(err.response?.data?.message || 'Action plans could not be loaded. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  }, [isEmployee]);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

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
      <div style={{ width: '100%', boxSizing: 'border-box' }}>
        {loadError && <p role="alert" style={{ color: theme.colors.danger }}>{loadError}</p>}
        {windowError && <p role="alert" style={{ color: theme.colors.danger }}>{windowError}</p>}
        {todayPlan ? (
          <div
            style={{
              background: theme.colors.surface,
              padding: '16px 18px',
              borderRadius: theme.radius.md,
              boxShadow: theme.shadow.sm,
              marginBottom: 20,
              borderLeft: `4px solid ${theme.colors.success}`,
              boxSizing: 'border-box',
              width: '100%',
            }}
          >
            <h3 style={{ marginTop: 0, color: theme.colors.primary, fontSize: 15 }}>
               Today's Action Plan Submitted
            </h3>
            <p style={{ whiteSpace: 'pre-line', fontSize: 13, marginBottom: 8, wordBreak: 'break-word', lineHeight: 1.4 }}>
              {todayPlan.plan}
            </p>
            <p style={{ fontSize: 11, color: theme.colors.muted, marginBottom: 0 }}>
              Submitted: {new Date(todayPlan.submittedAt).toLocaleString()}
            </p>
          </div>
        ) : (
          <div style={{ marginBottom: 20, width: '100%' }}>
            <button
              onClick={() => {
                if (windowError || !actionPlanWindow) {
                  toast.error(windowError || 'Submission time is unavailable.');
                  return;
                }
                if (!isWindowOpen) {
                  toast.error(`Action Plan submission window is closed (${formattedWindow} IST).`);
                  return;
                }
                setShowForm(true);
              }}
              disabled={!actionPlanWindow || !isWindowOpen || !!windowError || !!loadError}
              style={{
                width: '100%',
                padding: '12px 20px',
                background: isWindowOpen ? theme.colors.primary : theme.colors.muted,
                color: theme.colors.textLight,
                border: 'none',
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 13,
                cursor: isWindowOpen ? 'pointer' : 'not-allowed',
                boxShadow: isWindowOpen ? theme.shadow.md : 'none',
                transition: 'all 0.25s ease',
                opacity: isWindowOpen ? 1 : 0.7,
                boxSizing: 'border-box',
              }}
            >
              {!actionPlanWindow ? 'Loading submission time…' : isWindowOpen ? "+ Submit Today's Action Plan" : `Window Closed (${formattedWindow})`}
            </button>
          </div>
        )}

        <h3 style={{ marginTop: 8, marginBottom: 12, fontSize: 15, fontWeight: 700, color: theme.colors.text }}>
           My Action Plan History ({history.length})
        </h3>

        {history.length === 0 ? (
          <div style={{ padding: 30, background: theme.colors.surface, borderRadius: theme.radius.md, textAlign: 'center', color: theme.colors.muted, fontSize: 13, border: `1px solid ${theme.colors.border}` }}>
            अभी तक कोई Action Plan submit नहीं किया।
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
            {history.map((r, idx) => (
              <div
                key={r._id || idx}
                style={{
                  background: theme.colors.surface,
                  borderRadius: theme.radius.md,
                  border: `1px solid ${theme.colors.border}`,
                  boxShadow: theme.shadow.sm,
                  padding: 14,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  boxSizing: 'border-box',
                  width: '100%',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: theme.colors.primary }}> {r.date}</span>
                  <span style={{ fontSize: 11, color: theme.colors.muted }}>
                    {r.submittedAt ? new Date(r.submittedAt).toLocaleString() : '—'}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: theme.colors.text, whiteSpace: 'pre-line', wordBreak: 'break-word', lineHeight: 1.4 }}>
                  {r.plan}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ═══════════ ADMIN (BPM/CLF) VIEW ═══════════ */
  
  const columns = [
    { header: 'Employee', render: (r) => r.employeeId?.name || '—' },
    { header: 'Code', render: (r) => r.employeeId?.employeeCode || '—' },
    { header: 'Date', key: 'date' },
    { header: 'Plan', render: (r) => <div style={{ maxWidth: 500, whiteSpace: 'normal' }}>{r.plan}</div> },
  ];

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

  return (
    <div style={{ width: '100%', overflowX: 'auto', boxSizing: 'border-box' }}>
      <Table columns={columns} data={plans} loading={loading} />
    </div>
  );
}