import { useCallback, useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import NotificationList from './NotificationList.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Input from '../../components/ui/Input.jsx';
import Select from '../../components/ui/Select.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { theme } from '../../config/theme.js';
import { listClfs } from '../clfs/clfs.api.js';
import { getAuthUser } from '../../utils/authStorage.js';
import toast from 'react-hot-toast';
import * as api from './notifications.api.js';

const MESSAGE_TYPES = [
  { value: 'NOTICE', label: 'Notice' },
  { value: 'LETTER', label: 'Letter' },
  { value: 'INFORMATION', label: 'Information' },
];

export default function NotificationsPage() {
  const user = getAuthUser() || {};
  const isEmployee = user.role === 'EMPLOYEE';
  const isBPM = user.role === 'BPM';
  const isCLF = user.role === 'CLF';

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openCompose, setOpenCompose] = useState(false);

  const [trackingId, setTrackingId] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      if (isEmployee || isCLF) {
        const { data } = await api.myMessages();
        setItems(data.data || []);
      } else if (isBPM) {
        const { data } = await api.sentMessages();
        setItems(data.data || []);
      }
    } catch (err) {
      if (err.response?.status !== 429) console.error('Notifications load failed:', err);
    } finally {
      setLoading(false);
    }
  }, [isEmployee, isBPM, isCLF]);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => { if (!cancelled) await load(); };
    fetchData();
    return () => { cancelled = true; };
  }, [load]);

  const openTracking = async (messageId) => {
    setTrackingId(messageId);
    setTrackingData(null);
    setTrackingLoading(true);
    try {
      const { data } = await api.messageTracking(messageId);
      setTrackingData(data.data);
    } catch (err) {
      console.error('Tracking error:', err);
    } finally {
      setTrackingLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 24px' }}>
      <PageHeader title="Notifications" actions={isBPM && <Button onClick={() => setOpenCompose(true)}>+ New Message</Button>} />
      <div style={{ marginTop: 20 }}>
        <NotificationList
          items={items}
          isEmployee={isEmployee || isCLF}
          loading={loading}
          onMarkRead={async (id) => { await api.markRead(id); load(); }}
          onIgnore={async (id) => { await api.ignoreMessage(id); load(); }}
          onViewTracking={openTracking}
        />
      </div>

      <ComposeModal open={openCompose} onClose={() => setOpenCompose(false)} onSent={load} />

      <Modal open={!!trackingId} onClose={() => { setTrackingId(null); setTrackingData(null); }} title="Message Tracking">
        {trackingLoading && <div style={{ padding: '24px 0', textAlign: 'center', fontSize: 14, color: theme.colors.muted }}>Loading tracking data...</div>}
        {trackingData && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingTop: 8 }}>
            <div style={{ padding: '12px 16px', background: theme.colors.background, borderRadius: theme.radius.sm, border: `1px solid ${theme.colors.border}` }}>
              <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 600, color: theme.colors.text }}>{trackingData.message?.subject}</h3>
              <p style={{ margin: 0, fontSize: 12, color: theme.colors.muted }}>Sent on: {new Date(trackingData.message?.createdAt).toLocaleString()}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {[
                { label: 'Total Recipients', value: trackingData.stats?.total ?? 0, color: theme.colors.text },
                { label: 'Read', value: trackingData.stats?.read ?? 0, color: theme.colors.success },
                { label: 'Unread', value: trackingData.stats?.unread ?? 0, color: theme.colors.warning },
                { label: 'Ignored', value: trackingData.stats?.ignored ?? 0, color: theme.colors.danger },
              ].map((m) => (
                <div key={m.label} style={{ padding: '12px 14px', background: theme.colors.background, borderRadius: theme.radius.sm, border: `1px solid ${theme.colors.border}` }}>
                  <div style={{ fontSize: 11, color: theme.colors.muted, marginBottom: 4, textTransform: 'uppercase', fontWeight: 600 }}>{m.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: m.color }}>{m.value}</div>
                </div>
              ))}
            </div>

            <div style={{ maxHeight: 360, overflowY: 'auto', border: `1px solid ${theme.colors.border}`, borderRadius: theme.radius.sm }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: theme.colors.background, borderBottom: `1px solid ${theme.colors.border}`, position: 'sticky', top: 0, zIndex: 1 }}>
                    <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600 }}>Code</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600 }}>Name</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600 }}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {(trackingData.recipients || []).map((r, idx) => {
                    const isClfAdmin = !r.employeeId && r.userId;
                    return (
                      <tr key={r._id} style={{ borderBottom: idx === trackingData.recipients.length - 1 ? 'none' : `1px solid ${theme.colors.border}`, background: isClfAdmin ? `${theme.colors.info}10` : 'transparent' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 500, color: theme.colors.text }}>{r.employeeId?.employeeCode || (isClfAdmin ? 'CLF-ADMIN' : '—')}</td>
                        <td style={{ padding: '10px 14px', color: theme.colors.text }}>{r.employeeId?.name || (isClfAdmin ? 'CLF Admin' : '—')}</td>
                        <td style={{ padding: '10px 14px' }}><Badge variant={r.status === 'READ' ? 'success' : r.status === 'IGNORED' ? 'danger' : 'warning'}>{r.status}</Badge></td>
                        <td style={{ padding: '10px 14px', fontSize: 12, color: theme.colors.muted }}>{r.readAt ? new Date(r.readAt).toLocaleString() : r.ignoredAt ? new Date(r.ignoredAt).toLocaleString() : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function ComposeModal({ open, onClose, onSent }) {
  const [form, setForm] = useState({ clfId: '', messageType: 'NOTICE', subject: '', body: '' });
  const [clfs, setClfs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      listClfs()
        .then(({ data }) => {
          const clfList = (data.data.clfs || data.data || []).map((c) => ({
            value: c._id,
            label: `${c.name} (${c.code || c.loginId})`,
          }));
          setClfs(clfList);
          if (clfList.length > 0) {
            setForm((f) => ({ ...f, clfId: clfList[0].value, messageType: 'NOTICE' }));
          }
        })
        .catch((err) => {
          console.error('Failed to load CLFs:', err);
          toast.error('Failed to load CLFs');
        });
    }
  }, [open]);

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.clfId) {
      toast.error('Please select a CLF.');
      return;
    }
    if (!form.subject.trim() || !form.body.trim()) {
      toast.error('Subject and body are required.');
      return;
    }

    setLoading(true);
    try {
      await api.sendMessage({
        clfId: form.clfId,
        messageType: form.messageType || 'NOTICE',
        subject: form.subject.trim(),
        body: form.body.trim(),
      });
      setForm({ clfId: clfs[0]?.value || '', messageType: 'NOTICE', subject: '', body: '' });
      toast.success('Message sent successfully!');
      onSent?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Send Message to CLF">
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Select label="CLF" name="clfId" value={form.clfId} onChange={handle} options={clfs} required />
          <Select label="Type" name="messageType" value={form.messageType} onChange={handle} options={MESSAGE_TYPES} />
        </div>
        <Input label="Subject" name="subject" value={form.subject} onChange={handle} required />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: theme.colors.text, paddingLeft: 14 }}>Message Body</label>
          <textarea
            name="body"
            value={form.body}
            onChange={handle}
            rows={5}
            placeholder="Write your message here..."
            style={{ padding: '13px 20px', borderRadius: '12px', border: `1.5px solid ${theme.colors.border}`, fontSize: 14, fontFamily: 'inherit', outline: 'none', resize: 'vertical', background: theme.colors.surface, color: theme.colors.text }}
            required
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <Button type="submit" loading={loading}>Send Message</Button>
        </div>
      </form>
    </Modal>
  );
}