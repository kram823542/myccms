import { theme } from '../../config/theme.js';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  type = 'button',
  onClick,
  style = {},
}) {
  const variants = {
    primary: { bg: theme.colors.primary, color: theme.colors.textLight, border: 'none' },
    secondary: { bg: theme.colors.secondary, color: theme.colors.textLight, border: 'none' },
    outline: { bg: `${theme.colors.surface}00`, color: theme.colors.primary, border: `1.5px solid ${theme.colors.primary}` },
    danger: { bg: theme.colors.danger, color: theme.colors.textLight, border: 'none' },
    success: { bg: theme.colors.success, color: theme.colors.textLight, border: 'none' },
    warning: { bg: theme.colors.warning, color: theme.colors.textLight, border: 'none' },
    info: { bg: theme.colors.info, color: theme.colors.textLight, border: 'none' },
    ghost: { bg: `${theme.colors.background}00`, color: theme.colors.text, border: `1px solid ${theme.colors.border}` },
  };

  const sizes = {
    sm: { height: '36px', padding: '0 18px', fontSize: 13 },
    md: { height: '44px', padding: '0 24px', fontSize: 14 },
    lg: { height: '50px', padding: '0 30px', fontSize: 15 },
  };

  const v = variants[variant] || variants.primary;
  const s = sizes[size] || sizes.md;

  return (
    <>
      <button
        type={type}
        disabled={disabled || loading}
        onClick={onClick}
        className={`pill-slide-btn btn-variant-${variant}`}
        style={{
          background: v.bg,
          color: v.color,
          border: v.border,
          borderRadius: theme.radius.full || '9999px',
          fontWeight: 600,
          cursor: disabled || loading ? 'not-allowed' : 'pointer',
          opacity: disabled || loading ? 0.7 : 1,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          boxShadow: disabled || loading ? 'none' : theme.shadow.md,
          letterSpacing: '0.01em',
          position: 'relative',
          overflow: 'hidden',
          zIndex: 1,
          boxSizing: 'border-box',
          ...s,
          ...style,
        }}
      >
        <span className="hover-slide-overlay" />
        <span style={{ position: 'relative', zIndex: 2, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          {loading ? (
            <>
              <span className="btn-spinner" />
              <span>Loading...</span>
            </>
          ) : (
            children
          )}
        </span>
      </button>

      <style>{`
        .pill-slide-btn {
          border-radius: 9999px !important;
          transition: transform 0.25s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.25s ease, color 0.25s ease;
        }
        .hover-slide-overlay {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          border-radius: 9999px;
          background: linear-gradient(90deg, ${theme.colors.surface}00 0%, ${theme.colors.surface}40 50%, ${theme.colors.surface}00 100%);
          transition: left 0.45s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1;
          pointer-events: none;
        }
        .pill-slide-btn:not(:disabled):hover .hover-slide-overlay {
          left: 100%;
        }
        .pill-slide-btn:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 22px -4px ${theme.colors.primary}50;
        }
        .pill-slide-btn:not(:disabled):active {
          transform: translateX(-4px) scale(0.97);
          box-shadow: ${theme.shadow.sm};
          transition: transform 0.1s ease-out;
        }
        .btn-variant-outline .hover-slide-overlay {
          background: ${theme.colors.primary}20;
        }
        .btn-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid ${theme.colors.surface}55;
          border-top-color: ${theme.colors.surface};
          border-radius: 50%;
          animation: btnSpin 0.7s linear infinite;
        }
        .btn-variant-outline .btn-spinner,
        .btn-variant-ghost .btn-spinner {
          border-color: ${theme.colors.primary}35;
          border-top-color: ${theme.colors.primary};
        }
        @keyframes btnSpin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}