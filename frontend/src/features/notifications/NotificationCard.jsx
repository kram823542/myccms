import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import { theme } from '../../config/theme.js';

export default function NotificationCard({
  item,
  isEmployee,
  onMarkRead,
  onIgnore,
  onViewTracking,
}) {
  const msg = item.messageId || item;

  // For BPM sent messages — show tracking stats
  const showTracking = !isEmployee && item.totalRecipients !== undefined;

  return (
    <div
      style={{
        background: theme.colors.surface,
        borderRadius: theme.radius.md,
        padding: 18,
        marginBottom: 12,
        boxShadow: theme.shadow.sm,
        borderLeft: `4px solid ${
          item.status === 'UNREAD'
            ? theme.colors.accent
            : item.status === 'IGNORED'
            ? theme.colors.danger
            : theme.colors.border
        }`,
        opacity: item.status === 'IGNORED' ? 0.85 : 1,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <h3 style={{ margin: 0, fontSize: 15 }}>{msg.subject}</h3>
          {msg.senderName && (
            <p style={{ margin: '4px 0', fontSize: 12, color: theme.colors.muted }}>
              From: {msg.senderName} ({msg.senderRole})
            </p>
          )}
          <p style={{ margin: '10px 0', fontSize: 14, whiteSpace: 'pre-line' }}>{msg.body}</p>

          {/* Tracking stats for BPM sent messages */}
          {showTracking && (
            <div
              style={{
                display: 'flex',
                gap: 16,
                marginTop: 12,
                flexWrap: 'wrap',
                padding: 10,
                background: theme.colors.background,
                borderRadius: theme.radius.sm,
                fontSize: 12,
              }}
            >
              <div>
                <span style={{ color: theme.colors.muted }}>Recipients: </span>
                <b>{item.totalRecipients ?? 0}</b>
              </div>
              <div>
                <span style={{ color: theme.colors.muted }}>Read: </span>
                <b style={{ color: theme.colors.success }}>{item.readCount ?? 0}</b>
              </div>
              <div>
                <span style={{ color: theme.colors.muted }}>Unread: </span>
                <b style={{ color: theme.colors.warning }}>{item.unreadCount ?? 0}</b>
              </div>
              <div>
                <span style={{ color: theme.colors.muted }}>Ignored: </span>
                <b style={{ color: theme.colors.danger }}>{item.ignoredCount ?? 0}</b>
              </div>
            </div>
          )}

          <p style={{ margin: '10px 0 0', fontSize: 11, color: theme.colors.muted }}>
            {new Date(msg.createdAt).toLocaleString()}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
          <Badge
            variant={
              item.status === 'READ'
                ? 'success'
                : item.status === 'IGNORED'
                ? 'danger'
                : item.status === 'SENT'
                ? 'info'
                : 'warning'
            }
          >
            {item.status || 'SENT'}
          </Badge>

          {/*  UNREAD — Read + Ignore buttons */}
          {isEmployee && item.status === 'UNREAD' && (
            <div style={{ display: 'flex', gap: 6 }}>
              <Button size="sm" variant="success" onClick={() => onMarkRead?.(item._id)}>
                Read
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onIgnore?.(item._id)}>
                Ignore
              </Button>
            </div>
          )}

          {/*  IGNORED — Read Now button (dubara read kar sakte hain) */}
          {isEmployee && item.status === 'IGNORED' && (
            <div style={{ display: 'flex', gap: 6 }}>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onMarkRead?.(item._id)}
              >
                 Read Now
              </Button>
            </div>
          )}

          {/* BPM → View tracking button */}
          {showTracking && (
            <Button size="sm" variant="outline" onClick={() => onViewTracking?.(item._id)}>
              View Details
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}