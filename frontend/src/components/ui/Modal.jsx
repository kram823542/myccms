import { theme } from '../../config/theme.js';

export default function Modal({ open, isOpen, onClose, title, children, footer, size = 'md' }) {
  const isVisible = open ?? isOpen;
  if (!isVisible) return null;

  const sizes = {
    sm: 420,
    md: 540,
    lg: 760,
    xl: 1100,
  };
  const maxWidth = sizes[size] || sizes.md;

  return (
    <>
      <div
        className="clf-modal-overlay"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: `${theme.colors.text}80`,
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px 16px',
        }}
      >
        <div
          className="clf-modal-window"
          onClick={(e) => e.stopPropagation()}
          style={{
            background: theme.colors.surface,
            borderRadius: theme.radius.lg,
            width: '100%',
            maxWidth: `min(${maxWidth}px, calc(100vw - 24px))`,
            maxHeight: '88vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: theme.shadow.lg,
            position: 'relative',
            border: `1px solid ${theme.colors.border}`,
          }}
        >
          <div
            style={{
              padding: '20px 28px',
              borderBottom: `1px solid ${theme.colors.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'sticky',
              top: 0,
              background: `${theme.colors.surface}F2`,
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              zIndex: 10,
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: '19px',
                fontWeight: 700,
                color: theme.colors.text,
                letterSpacing: '-0.02em',
                lineHeight: 1.3,
              }}
            >
              {title}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="clf-modal-close"
              aria-label="Close modal"
              style={{
                border: 'none',
                background: theme.colors.background,
                width: 34,
                height: 34,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: theme.colors.muted,
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                outline: 'none',
                flexShrink: 0,
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div
            className="clf-modal-body"
            style={{
              padding: '28px',
              overflowY: 'auto',
              flex: 1,
              color: theme.colors.text,
              fontSize: '15px',
              lineHeight: 1.6,
            }}
          >
            {children}
          </div>

          {footer && (
            <div
              style={{
                padding: '18px 28px',
                borderTop: `1px solid ${theme.colors.border}`,
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: 12,
                background: theme.colors.background,
                borderBottomLeftRadius: theme.radius.lg,
                borderBottomRightRadius: theme.radius.lg,
              }}
            >
              {footer}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .clf-modal-overlay { animation: modalOverlayFade 0.25s ease-out; }
        .clf-modal-window { animation: modalSpringUp 0.32s cubic-bezier(0.16, 1, 0.3, 1); }
        .clf-modal-close:hover {
          background: ${theme.colors.border} !important;
          color: ${theme.colors.text} !important;
          transform: rotate(90deg) scale(1.05);
        }
        .clf-modal-close:active { transform: rotate(90deg) scale(0.92); }
        .clf-modal-body::-webkit-scrollbar { width: 6px; }
        .clf-modal-body::-webkit-scrollbar-track { background: transparent; }
        .clf-modal-body::-webkit-scrollbar-thumb { background: ${theme.colors.border}; border-radius: 9999px; }
        .clf-modal-body::-webkit-scrollbar-thumb:hover { background: ${theme.colors.muted}; }
        @keyframes modalOverlayFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalSpringUp { from { opacity: 0; transform: scale(0.93) translateY(16px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>
    </>
  );
}