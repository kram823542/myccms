import { useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';
import { theme } from '../../config/theme.js';

function EyeIcon({ show }) {
  return show ? (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>
  ) : (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  );
}

export default function ResetPasswordModal({
  open,
  onClose,
  entityName = '',
  entityLabel = 'user',
  currentUsername = '', 
  onConfirm, 
}) {
  const [username, setUsername] = useState(currentUsername);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  //  Eye Toggle States
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validate = () => {
    if (!username || username.trim() === '') {
      return 'Login ID (Username) cannot be empty';
    }
    if (newPassword) {
      if (newPassword.length < 8) {
        return 'Password must be at least 8 characters';
      }
      if (!/(?=.*[A-Za-z])(?=.*\d)/.test(newPassword)) {
        return 'Password must contain letters and numbers';
      }
      if (newPassword !== confirmPassword) {
        return 'Passwords do not match';
      }
    }
    return null;
  };

  const handleSubmit = async () => {
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onConfirm({ username, password: newPassword });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={success ? 'Credentials Updated' : `Manage Login — ${entityLabel}`}
    >
      {!success ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0 }}>
            Update login credentials for <b>{entityName}</b>:
          </p>

          <Input
            label="Login ID (Username)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter login ID"
            required
          />

          {/*  FIX: Input jaisa tha waisa hi hai, bas upar eye icon laga hai */}
          <div style={{ position: 'relative' }}>
            <Input
              label="New Password (optional)"
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '38px', // Input field ke center me laane ke liye adjust
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme.colors.muted,
                padding: 4,
              }}
            >
              <EyeIcon show={showNewPassword} />
            </button>
          </div>

          {newPassword && (
            <div style={{ position: 'relative' }}>
              <Input
                label="Confirm New Password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '38px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: theme.colors.muted,
                  padding: 4,
                }}
              >
                <EyeIcon show={showConfirmPassword} />
              </button>
            </div>
          )}

          {error && (
            <div
              style={{
                padding: 10,
                background: theme.colors.dangerSurface,
                color: theme.colors.danger,
                borderRadius: theme.radius.md,
                fontSize: 13,
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <Button variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} loading={loading}>
              Save Changes
            </Button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div
            style={{
              padding: 14,
              background: theme.colors.successSurface,
              color: theme.colors.success,
              borderRadius: theme.radius.md,
              fontSize: 14,
              fontWeight: 600,
            }}
          >
             Credentials updated successfully!
          </div>
          <p style={{ fontSize: 13, color: theme.colors.muted, margin: 0 }}>
            {entityName} ab naye Login ID {newPassword ? 'aur Password' : ''} se login kar sakta hai.
          </p>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <Button onClick={onClose}>Done</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}