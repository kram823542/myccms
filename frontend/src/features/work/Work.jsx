import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import ActionPlansPage from '../actionPlans/ActionPlansPage.jsx';
import WorkDonePage from '../workDone/WorkDonePage.jsx';
import { theme } from '../../config/theme.js';
import { getAuthUser } from '../../utils/authStorage.js';

export default function Work() {
  const user = getAuthUser() || {};
  const isEmployee = user.role === 'EMPLOYEE';

  const [tab, setTab] = useState('action-plan');

  const tabs = [
    {
      key: 'action-plan',
      label: 'Action Plan',
      icon: '📝',
      hint: '8 AM – 11 AM', // ✅ Updated from 10 AM to 8 AM
    },
    {
      key: 'work-done',
      label: 'Work Done',
      icon: '✅',
      hint: '5 PM – 10 PM',
    },
  ];

  // Slider calculation (0% or 50%)
  const activeIndex = tabs.findIndex(t => t.key === tab);
  const sliderLeft = `${activeIndex * (100 / tabs.length)}%`;

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', width: '100%', padding: '0 8px' }}>
      <PageHeader
        title={isEmployee ? 'Daily Reports' : 'Work'}
        subtitle={
          isEmployee
            ? 'Morning action plan & evening work done'
            : 'Action plans and work done submissions'
        }
      />

      {/* ✅ FIXED: Smooth Slider Pills */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          marginBottom: 28,
          marginTop: 8,
          padding: 6,
          background: theme.colors.background,
          borderRadius: 999,
          border: `1px solid ${theme.colors.border}`,
          boxShadow: theme.shadow.sm,
          maxWidth: 480, // Width control
          width: '100%', // Responsive
        }}
      >
        {/* ✅ Sliding Background */}
        <div
          style={{
            position: 'absolute',
            top: 6,
            bottom: 6,
            left: sliderLeft,
            width: `calc(${100 / tabs.length}% - 6px)`, // Thoda adjust kiya taaki perfect fit ho
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
                padding: '10px 12px',
                border: 'none',
                background: 'transparent',
                color: isActive ? theme.colors.textLight : theme.colors.muted,
                fontWeight: isActive ? 700 : 600,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'color 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                whiteSpace: 'nowrap', // Text wrap nahi hoga
              }}
            >
              <span style={{ fontSize: 16, opacity: isActive ? 1 : 0.7 }}>{t.icon}</span>
              <span>{t.label}</span>
              
              {/* Hint Text (Time) */}
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: 4,
                  background: isActive ? `${theme.colors.textLight}40` : `${theme.colors.muted}15`,
                  color: isActive ? theme.colors.textLight : theme.colors.muted,
                  display: window.innerWidth < 450 ? 'none' : 'inline-block', // Mobile pe hide
                  marginLeft: 2,
                }}
              >
                {t.hint}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div style={{ width: '100%', animation: 'fadeIn 0.3s ease' }}>
        {tab === 'action-plan' && <ActionPlansPage />}
        {tab === 'work-done' && <WorkDonePage />}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}