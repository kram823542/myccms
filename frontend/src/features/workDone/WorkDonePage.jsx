import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader.jsx';
import Table from '../../components/ui/Table.jsx';
import { getAuthUser } from '../../utils/authStorage.js';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Input from '../../components/ui/Input.jsx';
import WorkDoneForm from './WorkDoneForm.jsx';
import { theme } from '../../config/theme.js';
import * as api from './workDone.api.js';

// Image Thumbnail Component
function ImageThumb({ url, onPreview }) {
  if (!url) return <span style={{ color: theme.colors.muted }}>—</span>;
  return (
    <img
      src={url} alt="work" onClick={() => onPreview(url)}
      style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6, cursor: 'pointer', border: `1px solid ${theme.colors.border}`, transition: 'transform 0.15s ease' }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      title="Click to view full image"
    />
  );
}

function ReasonCell({ item }) {
  if (item.status !== 'REJECTED') return <span style={{ color: theme.colors.muted }}>—</span>;
  return (
    <div style={{ maxWidth: 180, fontSize: 11, color: theme.colors.danger, padding: '6px 8px', background: `${theme.colors.danger}08`, borderRadius: 6, borderLeft: `3px solid ${theme.colors.danger}`, lineHeight: 1.3, whiteSpace: 'normal', wordBreak: 'break-word' }}>
      {item.rejectionReason || 'No reason provided'}
    </div>
  );
}

export default function WorkDonePage() {
  const user = getAuthUser() || {};
  const isEmployee = user.role === 'EMPLOYEE';
  const isCLF = user.role === 'CLF';

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(!isEmployee);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // ✅ Edit ke liye
  const [tab, setTab] = useState('all');
  const [previewImg, setPreviewImg] = useState(null);
  
  const [selected, setSelected] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.listWorkDone({});
      setItems(data.data.workDone || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async () => {
    if (!selected) return;
    setProcessing(true);
    try {
      await api.approveWorkDone(selected._id);
      setSelected(null);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selected || !rejectReason.trim()) return;
    setProcessing(true);
    try {
      await api.rejectWorkDone(selected._id, rejectReason);
      setRejectReason('');
      setSelected(null);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject');
    } finally {
      setProcessing(false);
    }
  };

  if (isEmployee) {
    return (
      <>
        <PageHeader title="Work Done" subtitle="Window: 5:00 PM – 10:00 PM IST" />
        
        {showForm || editTarget ? (
          <WorkDoneForm 
            initialData={editTarget}
            onSubmitted={() => { setShowForm(false); setEditTarget(null); load(); }} 
            onCancel={() => { setShowForm(false); setEditTarget(null); }} 
          />
        ) : (
          <>
            <button onClick={() => setShowForm(true)} style={{ padding: '12px 20px', background: theme.colors.primary, color: theme.colors.textLight, border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer', marginBottom: 20 }}>
              + Submit Work Done
            </button>
            <Table
              columns={[
                { header: 'Date', key: 'date' },
                { header: 'Image', render: (r) => <ImageThumb url={r.imageUrl} onPreview={setPreviewImg} /> },
                { header: 'Description', render: (r) => <div style={{ maxWidth: 400 }}>{r.description}</div> },
                { header: 'Status', render: (r) => <Badge variant={r.status === 'APPROVED' ? 'success' : r.status === 'REJECTED' ? 'danger' : 'warning'}>{r.status}</Badge> },
                { header: 'Rejection Reason', render: (r) => <ReasonCell item={r} /> },
                {
                  header: 'Action',
                  render: (r) => {
                    // ✅ Agar REJECTED hai toh Edit button dikhao
                    if (r.status === 'REJECTED') {
                      return <Button size="sm" variant="outline" onClick={() => setEditTarget(r)}>✏️ Edit</Button>;
                    }
                    return <span style={{ color: theme.colors.muted }}>—</span>;
                  }
                }
              ]}
              data={items}
              loading={loading}
            />
          </>
        )}
        <Modal open={!!previewImg} onClose={() => setPreviewImg(null)} title="Work Image">
          {previewImg && <img src={previewImg} alt="work" style={{ maxWidth: '100%', borderRadius: 8 }} />}
        </Modal>
      </>
    );
  }

  // ═══════════ ADMIN (CLF / BPM) VIEW ═══════════
  const filteredItems = tab === 'pending' ? items.filter((i) => i.status === 'PENDING') : items;
  const pendingCount = items.filter((i) => i.status === 'PENDING').length;

  const columns = [
    { 
      header: 'Employee', 
      render: (r) => {
        const dp = r.employeeId?.userId?.profilePhoto || r.employeeId?.profilePhoto || null;
        const initial = (r.employeeId?.name || '?').charAt(0).toUpperCase();
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${theme.colors.primary}15`, border: `1px solid ${theme.colors.primary}40`, color: theme.colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 'bold', overflow: 'hidden', flexShrink: 0 }}>
              {dp ? <img src={dp} alt="dp" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initial}
            </div>
            <div>
              <div style={{ fontWeight: 600, color: theme.colors.text, fontSize: 13 }}>{r.employeeId?.name || '—'}</div>
              <div style={{ fontSize: 11, color: theme.colors.muted }}>{r.employeeId?.employeeCode || '—'}</div>
            </div>
          </div>
        );
      }
    },
    { header: 'CLF', render: (r) => (<span style={{ fontSize: 11, fontWeight: 700, color: theme.colors.primary, background: `${theme.colors.primary}10`, padding: '4px 8px', borderRadius: 6, display: 'inline-block', whiteSpace: 'nowrap' }}>{r.clfId?.name || r.employeeId?.clfId?.name || '—'}</span>) },
    { header: 'Date', key: 'date' },
    { header: 'Image', render: (r) => <ImageThumb url={r.imageUrl} onPreview={setPreviewImg} /> },
    { header: 'Description', render: (r) => <div style={{ maxWidth: 200, whiteSpace: 'normal', fontSize: 13 }}>{r.description}</div> },
    { header: 'Status', render: (r) => (<Badge variant={r.status === 'APPROVED' ? 'success' : r.status === 'REJECTED' ? 'danger' : 'warning'}>{r.status}</Badge>) },
    { header: 'Rejection Reason', render: (r) => <ReasonCell item={r} /> },
    {
      header: 'Action',
      render: (r) => {
        if (!isCLF || r.status !== 'PENDING') return <span style={{ color: theme.colors.muted }}>—</span>;
        return <Button size="sm" variant="success" onClick={() => setSelected(r)}>Review</Button>;
      },
    },
  ];

  return (
    <>
      <PageHeader
        title="Work Done"
        subtitle="All submissions with images — pending, approved, and rejected"
        actions={
          isCLF && (
            <Link to="/clf/work-done/approval" style={{ textDecoration: 'none' }}>
              <span style={{ padding: '10px 16px', background: theme.colors.primary, color: theme.colors.textLight, borderRadius: 10, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                Full Approvals Page
                {pendingCount > 0 && (
                  <span style={{ background: theme.colors.textLight, color: theme.colors.primary, borderRadius: 999, padding: '1px 8px', fontSize: 11, fontWeight: 800 }}>{pendingCount}</span>
                )}
              </span>
            </Link>
          )
        }
      />

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, borderBottom: `1px solid ${theme.colors.border}` }}>
        <TabBtn label={`All Submissions (${items.length})`} active={tab === 'all'} onClick={() => setTab('all')} />
        <TabBtn label={`Pending (${pendingCount})`} active={tab === 'pending'} onClick={() => setTab('pending')} />
      </div>

      {filteredItems.length === 0 ? (
        <div style={{ padding: 40, background: theme.colors.surface, borderRadius: theme.radius.md, textAlign: 'center', color: theme.colors.muted, fontSize: 13 }}>
          {tab === 'pending' ? 'No pending approvals 🎉' : 'No work done submissions yet.'}
        </div>
      ) : (
        <Table columns={columns} data={filteredItems} loading={loading} />
      )}

      <Modal open={!!previewImg} onClose={() => setPreviewImg(null)} title="Work Image">
        {previewImg && <img src={previewImg} alt="work" style={{ maxWidth: '100%', borderRadius: 8 }} />}
      </Modal>

      <Modal
        open={!!selected}
        onClose={() => { setSelected(null); setRejectReason(''); }}
        title="Review Work Done"
        footer={
          <>
            <Button variant="ghost" onClick={() => { setSelected(null); setRejectReason(''); }} disabled={processing}>Cancel</Button>
            <Button variant="success" onClick={handleApprove} loading={processing}>Approve</Button>
          </>
        }
      >
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div><b>Employee:</b> {selected.employeeId?.name} ({selected.employeeId?.employeeCode})</div>
            <div><b>CLF:</b> {selected.clfId?.name || selected.employeeId?.clfId?.name || '—'}</div>
            <div><b>Date:</b> {selected.date}</div>
            <div><b>Description:</b><p style={{ marginTop: 6 }}>{selected.description}</p></div>
            {selected.imageUrl && <img src={selected.imageUrl} alt="work" style={{ maxWidth: '100%', borderRadius: 8 }} />}
            <Input label="Reject Reason (if rejecting)" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Reason..." />
            <Button variant="danger" onClick={handleReject} loading={processing} disabled={!rejectReason.trim()}>Reject</Button>
          </div>
        )}
      </Modal>
    </>
  );
}

function TabBtn({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '10px 16px', border: 'none', background: 'transparent', cursor: 'pointer',
        fontSize: 13, fontWeight: 600, color: active ? theme.colors.primary : theme.colors.muted,
        borderBottom: active ? `2px solid ${theme.colors.primary}` : '2px solid transparent',
        marginBottom: -1, transition: 'color 0.2s',
      }}
    >
      {label}
    </button>
  );
}