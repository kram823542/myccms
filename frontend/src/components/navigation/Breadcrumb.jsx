import { useLocation, Link } from 'react-router-dom';
import { theme } from '../../config/theme.js';

export default function Breadcrumb() {
  const location = useLocation();
  
  // Path ko split karo (khali spaces hatao)
  const parts = location.pathname.split('/').filter(Boolean);

  // ✅ Modern Chevron Arrow Separator
  const Separator = () => (
    <svg
      width="14"
      height="14"
      fill="none"
      stroke={`${theme.colors.muted}60`} // Halka muted color
      strokeWidth="2.5"
      viewBox="0 0 24 24"
      style={{ flexShrink: 0, margin: '0 4px' }}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '10px 24px',
        background: theme.colors.surface,
        borderBottom: `1px solid ${theme.colors.border}`,
        fontSize: 13,
        fontWeight: 500,
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        // Halka sa shadow neeche
        boxShadow: theme.shadow.sm,
      }}
    >
      {/* ✅ Home Icon / Link */}
      <Link
        to="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          color: theme.colors.muted,
          textDecoration: 'none',
          padding: '6px 10px',
          borderRadius: '99px', // Pill shape
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = `${theme.colors.primary}08`;
          e.currentTarget.style.color = theme.colors.primary;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = theme.colors.muted;
        }}
      >
        <svg
          width="15"
          height="15"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      </Link>

      {parts.length > 0 && <Separator />}

      {parts.map((p, i) => {
        const isLast = i === parts.length - 1;
        const routeTo = `/${parts.slice(0, i + 1).join('/')}`;
        
        // Label format karo (e.g., "employees" -> "Employees", "work-done" -> "Work Done")
        const label = p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, ' ');

        return (
          <div key={i} style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
            {isLast ? (
              // ✅ Active Page (Solid Dark Pill)
              <span
                style={{
                  padding: '6px 14px',
                  borderRadius: '99px',
                  background: theme.colors.bbDarkBrown || theme.colors.text, // Dark background
                  fontWeight: 600,
                  color: theme.colors.textLight,
                  boxShadow: theme.shadow.sm,
                }}
              >
                {label}
              </span>
            ) : (
              // ✅ Clickable Link (Transparent Pill)
              <Link
                to={routeTo}
                style={{
                  color: theme.colors.muted,
                  textDecoration: 'none',
                  padding: '6px 12px',
                  borderRadius: '99px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `${theme.colors.primary}08`;
                  e.currentTarget.style.color = theme.colors.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = theme.colors.muted;
                }}
              >
                {label}
              </Link>
            )}

            {!isLast && <Separator />}
          </div>
        );
      })}
    </div>
  );
}