import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import { theme } from '../../config/theme.js';
import { clearAuthState, setAuthUser, setAuthToken, setRefreshToken } from '../../utils/authStorage.js';
import * as authApi from './auth.api.js';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await authApi.login(form);
      const { user, accessToken, refreshToken } = data.data;

      clearAuthState();
      setAuthToken(accessToken);
      setRefreshToken(refreshToken);
      setAuthUser(user);

      const redirects = {
        SUPER_ADMIN: '/super-admin',
        BPM: '/bpm',
        CLF: '/clf',
        EMPLOYEE: '/employee',
      };
      navigate(redirects[user.role] || '/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="login-form-wrapper"
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '20px', 
        width: '100%', 
        maxWidth: 400, 
        margin: '0 auto',
        fontFamily: "'Fredoka', 'Plus Jakarta Sans', sans-serif" 
      }}
    >
      {/* Mobile Brand Card Container */}
      <div className="mobile-card-container">
        {/* Mobile Logo */}
        <div className="mobile-logo" style={{ textAlign: 'center', display: 'none', marginBottom: '16px' }}>
          <img
            src="https://res.cloudinary.com/dsjnikk42/image/upload/v1789380290/WhatsApp_Image_2026-09-14_at_1.07.08_PM_nbbmda.jpg"
            alt="CLF Logo"
            style={{ 
              width: 72, 
              height: 72, 
              borderRadius: '50%', 
              objectFit: 'cover', 
              margin: '0 auto', 
              border: `3px solid ${theme.colors.primary}`,
              boxShadow: theme.shadow.md
            }}
          />
        </div>

        {/* Header Section */}
        <div className="login-header-section" style={{ textAlign: 'left', marginBottom: '24px' }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: 'clamp(28px, 6vw, 34px)', 
            fontWeight: 700, 
            fontStyle: 'italic',
            color: theme.colors.text,
            letterSpacing: '0.02em', 
            lineHeight: 1.15,
            textTransform: 'uppercase' 
          }}>
            Welcome Back
          </h1>
          <p style={{ 
            margin: '6px 0 0', 
            fontSize: '11.5px', 
            color: theme.colors.muted,
            fontWeight: 600, 
            lineHeight: 1.4,
            textTransform: 'uppercase', 
            letterSpacing: '0.06em',
            fontFamily: "'Plus Jakarta Sans', sans-serif"
          }}>
            Please sign in to access your portal account
          </p>
        </div>
      </div>

      {/* Input Fields Container */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="input-group" style={{ textTransform: 'uppercase' }}>
          <Input
            label="Username"
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="ENTER YOUR USERNAME"
            required
          />
        </div>

        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
          <div style={{ textTransform: 'uppercase' }}>
            <Input
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              placeholder="ENTER YOUR PASSWORD"
              required
            />
          </div>
          
          {/* Eye Icon */}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
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
            {showPassword ? (
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            ) : (
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Error Alert Box */}
      {error && (
        <div style={{ 
          padding: '12px 14px', 
          background: `${theme.colors.danger}12`,
          border: `1px solid ${theme.colors.danger}35`,
          color: theme.colors.danger,
          borderRadius: theme.radius.md || '8px', 
          fontSize: '12px', 
          fontWeight: 600, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 10, 
          animation: 'fadeIn 0.2s ease-in-out',
          textTransform: 'uppercase' 
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span style={{ lineHeight: 1.4 }}>{error}</span>
        </div>
      )}

      {/* Submit Button */}
      <Button 
        type="submit" 
        loading={loading} 
        size="lg" 
        style={{ 
          marginTop: '8px', 
          height: '48px', 
          borderRadius: theme.radius.md || '8px', 
          fontWeight: 700, 
          fontSize: '14px', 
          letterSpacing: '0.08em', 
          backgroundColor: theme.colors.primary,
          color: theme.colors.textLight,
          boxShadow: theme.shadow.md,
          transition: 'all 0.2s ease',
          textTransform: 'uppercase' 
        }}
      >
        Sign In
      </Button>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap');

        @media (max-width: 899px) {
          .mobile-logo { display: block !important; }
          .login-form-wrapper {
            background: ${theme.colors.surface};
            padding: 28px 20px;
            border-radius: 20px;
            box-shadow: ${theme.shadow.lg};
            border: 1px solid ${theme.colors.border};
          }
          .login-header-section {
            text-align: center !important;
            margin-bottom: 20px !important;
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        input::placeholder {
          text-transform: uppercase;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 600;
          letter-spacing: 0.5px;
          font-size: 12px;
        }
      `}</style>
    </form>
  );
}