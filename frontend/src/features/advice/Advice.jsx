import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import SalaryAdvice from './SalaryAdvice.jsx';
import ExpenseAdvice from './ExpenseAdvice.jsx';
import AdviceHistory from './AdviceHistory.jsx'; 
import { theme } from '../../config/theme.js';

export default function Advice() {
  const [tab, setTab] = useState('salary');
  
  const tabs = [
    { key: 'salary', label: ' Employee Salary' },
    { key: 'expense', label: ' Company Expense' },
    { key: 'history', label: ' History' },
  ];

  // Calculate slider position (0%, 33.33%, 66.66%) based on active tab
  const activeIndex = tabs.findIndex(t => t.key === tab);
  const sliderLeft = `${activeIndex * (100 / tabs.length)}%`;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 12px' }}>
      <PageHeader title="Advice" subtitle="Generate bank advice for employee salary or company expense" />
      
      {/*  NAYA: Perfect Slider Pill Tabs */}
      <div 
        style={{ 
          position: 'relative',
          display: 'flex',
          background: theme.colors.background, 
          border: `1px solid ${theme.colors.border}`, 
          borderRadius: 999, 
          padding: 4,
          marginBottom: 20,
          boxShadow: theme.shadow.sm,
          maxWidth: 500, // Desktop par zyada failne na de
          width: '100%',
        }}
      >
        {/*  Sliding Background */}
        <div
          style={{
            position: 'absolute',
            top: 4,
            bottom: 4,
            left: sliderLeft,
            width: `${100 / tabs.length}%`,
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
                flex: 1, //  Equal width distribution
                position: 'relative',
                zIndex: 2,
                padding: '8px 10px',
                border: 'none',
                background: 'transparent',
                color: isActive ? theme.colors.textLight : theme.colors.muted,
                fontWeight: isActive ? 700 : 600,
                fontSize: 11,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'color 0.3s ease',
                whiteSpace: 'nowrap', //  Text ko wrap hone se roke
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                borderRadius: 999,
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'salary' && <SalaryAdvice />}
      {tab === 'expense' && <ExpenseAdvice />}
      {tab === 'history' && <AdviceHistory />}
    </div>
  );
}