import { useEffect, useRef, useState } from 'react';
import { theme } from '../../config/theme.js';
import { getAuthUser } from '../../utils/authStorage.js';
import * as api from './notifications.api.js';

export default function NotificationPopup() {
  const [unread, setUnread] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const mountedRef = useRef(true);

  const user = getAuthUser() || {};
  const canReceive = ['EMPLOYEE', 'CLF'].includes(user.role);

  const fetchUnread = async () => {
    if (!canReceive) return;
    try {
      const { data } = await api.myMessages({ status: 'UNREAD' });
      if (!mountedRef.current) return;
      const items = data.data || [];
      setUnread(items);
      if (items.length > 0 && !expandedId) {
        setExpandedId(items[0]._id);
      }
    } catch (err) {
      // Silent — 429 ya network error
      if (err.response?.status !== 429) {
        console.debug('Notification poll failed:', err.message);
      }
    }
  };

  // ✅ Fetch on mount + on window focus (no interval)
  useEffect(() => {
    if (!canReceive) return;
    mountedRef.current = true;

    fetchUnread();

    // ✅ Jab user tab wapas focus kare
    const onFocus = () => fetchUnread();
    window.addEventListener('focus', onFocus);

    // ✅ 5 minute ka ek slow refresh (safety)
    const interval = setInterval(fetchUnread, 300000);  // 5 min

    return () => {
      mountedRef.current = false;
      window.removeEventListener('focus', onFocus);
      clearInterval(interval);
    };
  }, [canReceive]);

  const handleRead = async (id) => {
    setLoading(true);
    try {
      await api.markRead(id);
      setUnread((prev) => {
        const next = prev.filter((item) => item._id !== id);
        if (next.length > 0) setExpandedId(next[0]._id);
        else setExpandedId(null);
        return next;
      });
    } catch (err) {
      console.error('Read failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleIgnore = async (id) => {
    setLoading(true);
    try {
      await api.ignoreMessage(id);
      setUnread((prev) => {
        const next = prev.filter((item) => item._id !== id);
        if (next.length > 0) setExpandedId(next[0]._id);
        else setExpandedId(null);
        return next;
      });
    } catch (err) {
      console.error('Ignore failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!canReceive || unread.length === 0) return null;

  const current = unread.find((u) => u._id === expandedId) || unread[0];
  const msg = current.messageId;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: theme.colors.overlayStrong,
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0 }
          to { transform: translateY(0); opacity: 1 }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>

      <div
        style={{
          background: theme.colors.surface,
          borderRadius: theme.radius.lg,
          width: '100%',
          maxWidth: 500,
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: theme.shadow.lg,
          animation: 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: `1px solid ${theme.colors.border}`,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: `linear-gradient(135deg, ${theme.colors.primary}11, ${theme.colors.primary}05)`,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: theme.colors.primary,
              color: theme.colors.textLight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              animation: 'pulse 2s infinite',
            }}
          >
            🔔
          </div>
          <div style={{ flex: 1 }}>
            <h2
              style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 700,
                color: theme.colors.text,
              }}
            >
              New Message {unread.length > 1 ? `(${unread.length})` : ''}
            </h2>
            <p
              style={{
                margin: '2px 0 0',
                fontSize: 12,
                color: theme.colors.muted,
              }}
            >
              Read or ignore to continue
            </p>
          </div>
        </div>

        {unread.length > 1 && (
          <div
            style={{
              display: 'flex',
              gap: 6,
              padding: '10px 16px',
              overflowX: 'auto',
              borderBottom: `1px solid ${theme.colors.border}`,
              background: theme.colors.background,
            }}
          >
            {unread.map((u, idx) => (
              <button
                key={u._id}
                onClick={() => setExpandedId(u._id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 999,
                  border: 'none',
                  background: expandedId === u._id ? theme.colors.primary : 'transparent',
                  color: expandedId === u._id ? theme.colors.textLight : theme.colors.muted,
                  fontWeight: 600,
                  fontSize: 12,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                }}
              >
                #{idx + 1}
              </button>
            ))}
          </div>
        )}

        <div style={{ padding: 20 }}>
          <h3
            style={{
              margin: '0 0 8px',
              fontSize: 17,
              fontWeight: 700,
              color: theme.colors.text,
            }}
          >
            {msg?.subject || '(No subject)'}
          </h3>

          <div
            style={{
              display: 'flex',
              gap: 12,
              fontSize: 12,
              color: theme.colors.muted,
              marginBottom: 16,
              flexWrap: 'wrap',
            }}
          >
            <span>
              From: <b style={{ color: theme.colors.text }}>{msg?.senderName}</b> ({msg?.senderRole})
            </span>
            <span>{msg?.createdAt ? new Date(msg.createdAt).toLocaleString() : ''}</span>
          </div>

          <div
            style={{
              background: theme.colors.background,
              padding: 14,
              borderRadius: theme.radius.md,
              border: `1px solid ${theme.colors.border}`,
              fontSize: 14,
              lineHeight: 1.6,
              color: theme.colors.text,
              whiteSpace: 'pre-wrap',
              marginBottom: 18,
            }}
          >
            {msg?.body}
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button
              onClick={() => handleIgnore(current._id)}
              disabled={loading}
              style={{
                padding: '10px 18px',
                background: 'transparent',
                color: theme.colors.muted,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.radius.md,
                fontSize: 13,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              Ignore
            </button>
            <button
              onClick={() => handleRead(current._id)}
              disabled={loading}
              style={{
                padding: '10px 18px',
                background: theme.colors.primary,
                color: theme.colors.textLight,
                border: 'none',
                borderRadius: theme.radius.md,
                fontSize: 13,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              ✓ {loading ? 'Please wait...' : 'Mark as Read'}
            </button>
          </div>

          <p
            style={{
              margin: '14px 0 0',
              fontSize: 11,
              color: theme.colors.muted,
              textAlign: 'center',
            }}
          >
            ⚠️ इस message को Read या Ignore करने तक आप कुछ और नहीं कर सकते।
          </p>
        </div>
      </div>
    </div>
  );
}