import { theme } from '../../config/theme.js';

export default function Input({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  disabled = false,
  style = {},
}) {
  const primaryColor = theme.colors.primary;
  const borderColor = error ? theme.colors.danger : theme.colors.border;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%', ...style }}>
      {label && (
        <label style={{ fontSize: 13, fontWeight: 600, color: theme.colors.text, paddingLeft: 14 }}>
          {label} {required && <span style={{ color: theme.colors.danger }}>*</span>}
        </label>
      )}
      <input
        type={type}
        name={name}
        value={value ?? ''}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className="clf-pill-input"
        style={{
          padding: '13px 20px',
          borderRadius: theme.radius.full || '9999px',
          border: `1.5px solid ${borderColor}`,
          fontSize: 14,
          outline: 'none',
          background: disabled ? theme.colors.background : theme.colors.surface,
          color: theme.colors.text,
          transition: 'all 0.2s ease-in-out',
          boxSizing: 'border-box',
          width: '100%',
        }}
      />
      {error && (
        <span style={{ fontSize: 12, color: theme.colors.danger, paddingLeft: 14 }}>
          {error}
        </span>
      )}
      <style>{`
        .clf-pill-input:focus {
          background: ${theme.colors.surface} !important;
          border-color: ${primaryColor} !important;
          box-shadow: 0 0 0 4px ${primaryColor}1A !important;
        }
      `}</style>
    </div>
  );
}