import { theme } from '../../config/theme.js';

export default function Select({
  label,
  name,
  value,
  onChange,
  options = [],
  required = false,
  error,
  disabled = false,
  placeholder = 'Select...',
  style = {},
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%', ...style }}>
      {label && (
        <label style={{ fontSize: 13, fontWeight: 600, color: theme.colors.text }}>
          {label} {required && <span style={{ color: theme.colors.danger }}>*</span>}
        </label>
      )}
      <select
        name={name}
        value={value ?? ''}
        onChange={onChange}
        disabled={disabled}
        required={required}
        style={{
          padding: '12px 14px',
          borderRadius: theme.radius.md,
          border: `1.5px solid ${error ? theme.colors.danger : theme.colors.border}`,
          fontSize: 14,
          outline: 'none',
          background: disabled ? theme.colors.background : theme.colors.surface,
          color: theme.colors.text,
          cursor: disabled ? 'not-allowed' : 'pointer',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <span style={{ fontSize: 12, color: theme.colors.danger }}>{error}</span>}
    </div>
  );
}