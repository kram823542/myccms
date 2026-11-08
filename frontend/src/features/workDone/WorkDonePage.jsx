import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader.jsx';
import { getAuthUser } from '../../utils/authStorage.js';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Input from '../../components/ui/Input.jsx';
import WorkDoneForm from './WorkDoneForm.jsx';
import { theme } from '../../config/theme.js';
import * as api from './workDone.api.js';
import { useSubmissionWindows } from '../../hooks/useSubmissionWindows.js';
import { formatSubmissionWindow } from '../../utils/submissionWindow.js';

// Image Thumbnail Component
function ImageThumb({ url, onPreview }) {
  if (!url) return <span style={{ color: theme.colors.muted }}>—</span>;
  return (
    <img
      src={url} alt="work" onClick={() => onPreview(url)}
      style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8, cursor: 'pointer', border: `1px solid ${theme.colors.border}`, transition: 'transform 0.15s ease' }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      title="Click to view full image"
    />
  );
}

export default function WorkDonePage({ initialTab = 'all' }) {
  const user = getAuthUser() || {};
  const isEmployee = user.role === 'EMPLOYEE';
  const isCLF = user.role === 'CLF';

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(!isEmployee);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [tab, setTab] = useState(initialTab);
  const [previewImg, setPreviewImg] = useState(null);
  
  const [selected, setSelected] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const { windows, error: windowError } = useSubmissionWindows();
  const workDoneWindow = windows?.workDone;
  const workDoneWindowLabel = formatSubmissionWindow(workDoneWindow);

  const load = useCallback(async () => {
    try {
      const { data } = await api.listWorkDone({});
      setItems(data.data.workDone || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

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
      <div style={{ width: '100%', boxSizing: 'border-box' }}>
        <PageHeader
          title="Work Done"
          subtitle={workDoneWindow ? `Submission window: ${workDoneWindowLabel} ${workDoneWindow.timezone}` : windowError ? 'Submission window unavailable' : 'Loading submission window…'}
        />
        
        {showForm || editTarget ? (
          <WorkDoneForm 
            key={editTarget?._id || 'new'}
            initialData={editTarget}
            onSubmitted={() => { setShowForm(false); setEditTarget(null); load(); }} 
            onCancel={() => { setShowForm(false); setEditTarget(null); }} 
          />
        ) : (
          <>
            <button
              onClick={() => setShowForm(true)}
              disabled={!workDoneWindow?.isOpen}
              title={windowError || (workDoneWindow && !workDoneWindow.isOpen ? `Submission window: ${workDoneWindowLabel} ${workDoneWindow.timezone}` : '')}
              style={{ width: '100%', padding: '12px 20px', background: workDoneWindow?.isOpen ? theme.colors.primary : theme.colors.muted, color: theme.colors.textLight, border: 'none', borderRadius: 10, fontWeight: 600, cursor: workDoneWindow?.isOpen ? 'pointer' : 'not-allowed', marginBottom: 16, boxSizing: 'border-box' }}
            >
              + Submit Work Done
            </button>
            {windowError && <p role="alert" style={{ color: theme.colors.danger }}>{windowError}</p>}
            
            {loading ? (
              <div style={{ textAlign: 'center', padding: 30, color: theme.colors.muted, fontSize: 13 }}>Loading submissions...</div>
            ) : items.length === 0 ? (
              <div style={{ padding: 30, background: theme.colors.surface, borderRadius: theme.radius.md, textAlign: 'center', color: theme.colors.muted, fontSize: 13, border: `1px solid ${theme.colors.border}` }}>
                No work done submissions yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
                {items.map((r) => (
                  <div 
                    key={r._id || r.date} 
                    style={{ 
                      background: theme.colors.surface, 
                      borderRadius: theme.radius.md, 
                      border: `1px solid ${theme.colors.border}`, 
                      boxShadow: theme.shadow.sm, 
                      padding: 14, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: 10,
                      boxSizing: 'border-box',
                      width: '100%'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: theme.colors.muted }}> {r.date}</span>
                      <Badge variant={r.status === 'APPROVED' ? 'success' : r.status === 'REJECTED' ? 'danger' : 'warning'}>
                        {r.status}
                      </Badge>
                    </div>

                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      {r.imageUrl && (
                        <div style={{ flexShrink: 0 }}>
                          <img
                            src={r.imageUrl} 
                            alt="work" 
                            onClick={() => setPreviewImg(r.imageUrl)}
                            style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, cursor: 'pointer', border: `1px solid ${theme.colors.border}` }}
                            title="Click to view full image"
                          />
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 13, color: theme.colors.text, wordBreak: 'break-word', lineHeight: 1.4 }}>
                          {r.description}
                        </p>
                      </div>
                    </div>

                    {r.status === 'REJECTED' && (
                      <div style={{ fontSize: 11, color: theme.colors.danger, padding: '8px 10px', background: `${theme.colors.danger}10`, borderRadius: 6, borderLeft: `3px solid ${theme.colors.danger}`, wordBreak: 'break-word' }}>
                        <b>Reason:</b> {r.rejectionReason || 'No reason provided'}
                      </div>
                    )}

                    {r.status === 'REJECTED' && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 4 }}>
                        <Button size="sm" variant="outline" onClick={() => setEditTarget(r)}> Edit & Resubmit</Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        <Modal open={!!previewImg} onClose={() => setPreviewImg(null)} title="Work Image">
          {previewImg && <img src={previewImg} alt="work" style={{ maxWidth: '100%', borderRadius: 8 }} />}
        </Modal>
      </div>
    );
  }

  // ═══════════ ADMIN (CLF / BPM) VIEW - CARD LAYOUT ═══════════
  const filteredItems = tab === 'pending' ? items.filter((i) => i.status === 'PENDING') : items;
  const pendingCount = items.filter((i) => i.status === 'PENDING').length;

  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>
      <PageHeader
        title="Work Done"
        subtitle="All submissions with images — pending, approved, and rejected"
        actions={
          isCLF ? tab !== 'pending' ? (
            <Link to="/clf/work-done/approval" style={{ textDecoration: 'none' }}>
              <span style={{ padding: '10px 16px', background: theme.colors.primary, color: theme.colors.textLight, borderRadius: 10, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                Full Approvals Page
                {pendingCount > 0 && (
                  <span style={{ background: theme.colors.textLight, color: theme.colors.primary, borderRadius: 999, padding: '1px 8px', fontSize: 11, fontWeight: 800 }}>{pendingCount}</span>
                )}
              </span>
            </Link>
          ) : (
            <Link to="/clf/work-done" style={{ textDecoration: 'none' }}>
              <span style={{ padding: '10px 16px', background: theme.colors.primary, color: theme.colors.textLight, borderRadius: 10, fontWeight: 600 }}>All Submissions</span>
            </Link>
          ) : null
        }
      />

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, borderBottom: `1px solid ${theme.colors.border}` }}>
        <TabBtn label={`All Submissions (${items.length})`} active={tab === 'all'} onClick={() => setTab('all')} />
        <TabBtn label={`Pending (${pendingCount})`} active={tab === 'pending'} onClick={() => setTab('pending')} />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: theme.colors.muted, fontSize: 13 }}>Loading submissions...</div>
      ) : filteredItems.length === 0 ? (
        <div style={{ padding: 40, background: theme.colors.surface, borderRadius: theme.radius.md, textAlign: 'center', color: theme.colors.muted, fontSize: 13, border: `1px solid ${theme.colors.border}` }}>
          {tab === 'pending' ? 'No pending approvals ' : 'No work done submissions yet.'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
          {filteredItems.map((r) => {
            const dp = r.employeeId?.userId?.profilePhoto || r.employeeId?.profilePhoto || null;
            const initial = (r.employeeId?.name || '?').charAt(0).toUpperCase();
            const clfName = r.clfId?.name || r.employeeId?.clfId?.name || '—';

            return (
              <div 
                key={r._id || r.date} 
                style={{ 
                  background: theme.colors.surface, 
                  borderRadius: theme.radius.md, 
                  border: `1px solid ${theme.colors.border}`, 
                  boxShadow: theme.shadow.sm, 
                  padding: 14, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 10,
                  boxSizing: 'border-box',
                  width: '100%'
                }}
              >
                {/* Top Row: Employee Info & Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: `${theme.colors.primary}15`, border: `1px solid ${theme.colors.primary}40`, color: theme.colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 'bold', overflow: 'hidden', flexShrink: 0 }}>
                      {dp ? <img src={dp} alt="dp" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initial}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: theme.colors.text, fontSize: 13 }}>{r.employeeId?.name || '—'}</div>
                      <div style={{ fontSize: 11, color: theme.colors.muted }}>{r.employeeId?.employeeCode || '—'} • CLF: {clfName}</div>
                    </div>
                  </div>
                  <Badge variant={r.status === 'APPROVED' ? 'success' : r.status === 'REJECTED' ? 'danger' : 'warning'}>
                    {r.status}
                  </Badge>
                </div>

                {/* Date & Meta Row */}
                <div style={{ fontSize: 12, fontWeight: 700, color: theme.colors.muted }}>
                   Date: {r.date}
                </div>

                {/* Middle Row: Image and Description */}
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  {r.imageUrl && (
                    <div style={{ flexShrink: 0 }}>
                      <ImageThumb url={r.imageUrl} onPreview={setPreviewImg} />
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 13, color: theme.colors.text, wordBreak: 'break-word', lineHeight: 1.4 }}>
                      {r.description}
                    </p>
                  </div>
                </div>

                {/* Rejection Reason if any */}
                {r.status === 'REJECTED' && (
                  <div style={{ fontSize: 11, color: theme.colors.danger, padding: '8px 10px', background: `${theme.colors.danger}10`, borderRadius: 6, borderLeft: `3px solid ${theme.colors.danger}`, wordBreak: 'break-word' }}>
                    <b>Reason:</b> {r.rejectionReason || 'No reason provided'}
                  </div>
                )}

                {/* Action Button for Review */}
                {isCLF && r.status === 'PENDING' && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 4 }}>
                    <Button size="sm" variant="success" onClick={() => setSelected(r)}>Review</Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
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
    </div>
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