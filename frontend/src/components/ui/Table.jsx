import { theme } from '../../config/theme.js';

export default function Table({ columns = [], data = [], loading = false, emptyMessage = 'No data found' }) {
  return (
    <div
      style={{
        background: theme.colors.surface,
        borderRadius: theme.radius.md,
        boxShadow: theme.shadow.sm,
        border: `1px solid ${theme.colors.border}`,
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <style>{`
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        .skeleton-line {
          background: ${theme.colors.background};
          background-image: linear-gradient(to right, ${theme.colors.background} 0%, ${theme.colors.border} 20%, ${theme.colors.background} 40%, ${theme.colors.background} 100%);
          background-repeat: no-repeat;
          background-size: 1000px 100%;
          animation: shimmer 1.5s infinite linear forwards;
          border-radius: 4px;
        }
      `}</style>

      <div style={{ overflowX: 'auto', maxWidth: '100vw', WebkitOverflowScrolling: 'touch' }}>
        <table style={{ width: '100%', minWidth: Math.max(columns.length * 150, 700), borderCollapse: 'collapse', fontSize: 14 }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: theme.colors.surface }}>
            <tr>
              {columns.map((c, i) => (
                <th
                  key={i}
                  style={{
                    padding: '16px',
                    textAlign: 'left',
                    fontWeight: 700,
                    fontSize: 12,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    color: theme.colors.muted,
                    borderBottom: `2px solid ${theme.colors.border}`,
                    whiteSpace: 'nowrap',
                    background: theme.colors.surface,
                  }}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, rowIndex) => (
                <tr key={`skeleton-${rowIndex}`} style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
                  {columns.map((_, colIndex) => (
                    <td key={`skeleton-col-${colIndex}`} style={{ padding: '16px' }}>
                      <div
                        className="skeleton-line"
                        style={{
                          height: 16,
                          width: colIndex === 0 ? '60%' : colIndex % 2 === 0 ? '45%' : '80%',
                          maxWidth: 180,
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: '80px 20px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                    <div style={{
                      width: 72, height: 72,
                      background: `${theme.colors.primary}08`,
                      borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: `1px dashed ${theme.colors.primary}30`,
                    }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={theme.colors.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                        <polyline points="13 2 13 9 20 9"></polyline>
                      </svg>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ color: theme.colors.text, fontSize: 16, fontWeight: 700 }}>No Data Available</span>
                      <span style={{ color: theme.colors.muted, fontSize: 14 }}>{emptyMessage}</span>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, ri) => (
                <tr
                  key={ri}
                  style={{
                    borderBottom: `1px solid ${theme.colors.border}`,
                    transition: 'background 0.2s ease',
                    background: ri % 2 === 0 ? theme.colors.surface : `${theme.colors.background}50`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${theme.colors.primary}08`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = ri % 2 === 0 ? theme.colors.surface : `${theme.colors.background}50`;
                  }}
                >
                  {columns.map((c, ci) => (
                    <td
                      key={ci}
                      style={{
                        padding: '16px',
                        color: theme.colors.text,
                        whiteSpace: 'nowrap',
                        verticalAlign: 'middle',
                      }}
                    >
                      {c.render ? c.render(row) : row[c.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}