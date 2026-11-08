import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import ActionPlansPage from '../actionPlans/ActionPlansPage.jsx';
import WorkDonePage from '../workDone/WorkDonePage.jsx';
import { theme } from '../../config/theme.js';
import { getAuthUser } from '../../utils/authStorage.js';
import { useSubmissionWindows } from '../../hooks/useSubmissionWindows.js';
import { formatSubmissionWindow } from '../../utils/submissionWindow.js';

export default function Work() {
  const user = getAuthUser() || {};
  const isEmployee = user.role === 'EMPLOYEE';
  const { windows, error } = useSubmissionWindows();

  const [tab, setTab] = useState('action-plan');

  const tabs = [
    {
      key: 'action-plan',
      label: 'Action Plan',
      icon: '',
      hint: windows ? formatSubmissionWindow(windows.actionPlan) : error ? 'Restart API' : 'Loading…',
    },
    {
      key: 'work-done',
      label: 'Work Done',
      icon: '',
      hint: windows ? formatSubmissionWindow(windows.workDone) : error ? 'Restart API' : 'Loading…',
    },
  ];

  const activeIndex = tabs.findIndex(t => t.key === tab);
  const sliderLeft = `${activeIndex * (100 / tabs.length)}%`;

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', width: '100%', padding: '0 8px', boxSizing: 'border-box', overflowX: 'hidden' }}>
      <PageHeader
        title={isEmployee ? 'Daily Reports' : 'Work'}
        subtitle={
          isEmployee
            ? 'Morning action plan & evening work done'
            : 'Action plans and work done submissions'
        }
      />

      {/*  Fully Responsive Slider Container */}
      <div
        className="work-tabs-container"
        style={{
          position: 'relative',
          display: 'flex',
          marginBottom: 24,
          marginTop: 8,
          padding: 4,
          background: theme.colors.surface,
          borderRadius: 999,
          border: `1px solid ${theme.colors.border}`,
          boxShadow: theme.shadow.sm,
          maxWidth: 480,
          width: '100%',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}
      >
        {/* Sliding Background Pill */}
        <div
          style={{
            position: 'absolute',
            top: 4,
            bottom: 4,
            left: sliderLeft,
            width: `calc(${100 / tabs.length}% - 4px)`,
            background: theme.colors.primary,
            borderRadius: 999,
            transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 1,
            boxShadow: theme.shadow.md,
          }}
        />

        {tabs.map((t) => {
          const isActive = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                flex: 1,
                position: 'relative',
                zIndex: 2,
                padding: '8px 10px',
                border: 'none',
                background: 'transparent',
                color: isActive ? theme.colors.textLight : theme.colors.muted,
                fontWeight: isActive ? 700 : 600,
                fontSize: 'clamp(11px, 2.8vw, 13px)',
                cursor: 'pointer',
                transition: 'color 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                whiteSpace: 'nowrap',
                minWidth: 0,
              }}
            >
              <span style={{ fontSize: 'clamp(13px, 3.5vw, 15px)', opacity: isActive ? 1 : 0.8, flexShrink: 0 }}>{t.icon}</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.label}</span>
              
              {/* Responsive Hint Text */}
              <span
                className="tab-hint-badge"
                style={{
                  fontSize: 8,
                  fontWeight: 700,
                  padding: '2px 4px',
                  borderRadius: 4,
                  background: isActive ? `${theme.colors.textLight}33` : `${theme.colors.muted}15`,
                  color: isActive ? theme.colors.textLight : theme.colors.muted,
                  marginLeft: 2,
                  flexShrink: 0,
                }}
              >
                {t.hint}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content Area with strict overflow safety */}
      <div style={{ width: '100%', maxWidth: '100vw', boxSizing: 'border-box', animation: 'fadeIn 0.3s ease', overflowX: 'hidden' }}>
        {tab === 'action-plan' && <ActionPlansPage />}
        {tab === 'work-done' && <WorkDonePage />}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 380px) {
          .tab-hint-badge { display: none !important; }
        }
      `}</style>
    </div>
  );
}