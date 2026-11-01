import Modal from './Modal.jsx';
import Button from './Button.jsx';
import { theme } from '../../config/theme.js';

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
}) {
  const getIcon = () => {
    if (variant === 'danger') {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.colors.danger} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      );
    }
    if (variant === 'warning') {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.colors.warning} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      );
    }
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.colors.info} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
    );
  };

  const getIconColor = () => {
    if (variant === 'danger') return theme.colors.danger;
    if (variant === 'warning') return theme.colors.warning;
    return theme.colors.info;
  };

  const getIconBg = () => {
    if (variant === 'danger') return `${theme.colors.danger}10`;
    if (variant === 'warning') return `${theme.colors.warning}10`;
    return `${theme.colors.info}10`;
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title=""
      footer={
        <div style={{
          display: 'flex',
          gap: 12,
          width: '100%',
          justifyContent: 'flex-end',
          paddingTop: 20,
          borderTop: `1px solid ${theme.colors.border}50`,
          marginTop: 20,
        }}>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button variant={variant} onClick={onConfirm} loading={loading}>
            {confirmText}
          </Button>
        </div>
      }
    >
      <div style={{ padding: '10px 0' }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: theme.radius.md,
              background: getIconBg(),
              border: `1px solid ${getIconColor()}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {getIcon()}
          </div>

          <div style={{ flex: 1, paddingTop: 2 }}>
            <h2 style={{
              margin: '0 0 8px',
              fontSize: 18,
              fontWeight: 700,
              color: theme.colors.text,
              letterSpacing: '-0.3px',
            }}>
              {title}
            </h2>
            <p style={{
              margin: 0,
              fontSize: 14,
              color: theme.colors.muted,
              lineHeight: 1.5,
            }}>
              {message}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}