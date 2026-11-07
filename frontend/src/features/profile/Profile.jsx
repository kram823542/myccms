import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import { clearAuthState, getAuthUser, setAuthUser } from '../../utils/authStorage.js';
import Input from '../../components/ui/Input.jsx';
import Loader from '../../components/ui/Loader.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Modal from '../../components/ui/Modal.jsx';
import ClfBodModal from '../clfs/ClfBodModal.jsx';
import { theme } from '../../config/theme.js';
import * as api from './profile.api.js';
import { getEmployee } from '../employees/employees.api.js';
import { getClf } from '../clfs/clfs.api.js';
import ReportsPage from '../reports/ReportsPage.jsx';
import toast from 'react-hot-toast';

export default function Profile() {
  const user = getAuthUser() || {};
  const role = user.role;
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [tab, setTab] = useState('profile');
  const [profile, setProfile] = useState(null);
  const [extra, setExtra] = useState(null);
  const [form, setForm] = useState({ email: '', mobile: '' });
  
  const [selectedFile, setSelectedFile] = useState(null); 
  const [previewImage, setPreviewImage] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [emailEdit, setEmailEdit] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  
  const [openBodModal, setOpenBodModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.getMyProfile();
      const me = data.data;
      setProfile(me);
      let empDetail = null;
      if (me.role === 'EMPLOYEE' && me.employeeId) {
        try { 
          const empRes = await getEmployee(me.employeeId); 
          empDetail = empRes.data.data; 
          setExtra(empDetail); 
        } catch (e) {}
      } else if (me.role === 'CLF' && me.clfId) {
        try { 
          const clfRes = await getClf(me.clfId); 
          setExtra(clfRes.data.data); 
        } catch (e) {}
      }
      setForm({ email: me.email || '', mobile: me.mobile || empDetail?.mobile || '' });
      setEmailEdit(!me.email);
    } catch (err) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error('Image must be less than 5MB');
    setSelectedFile(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('email', form.email);
      formData.append('mobile', form.mobile);
      if (selectedFile) formData.append('profilePhoto', selectedFile);
      const { data } = await api.updateMyProfile(formData);
      const updated = data.data;
      setProfile(updated);

      const stored = getAuthUser() || {};
      setAuthUser({ ...stored, ...updated });
      window.dispatchEvent(new Event('storage'));

      toast.success('Profile updated ✅');
      setEmailEdit(false);
      setSelectedFile(null);
      setPreviewImage(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try { await api.logout?.(); } catch (e) {}
    clearAuthState();
    toast.success('Logged out');
    navigate('/login');
  };

  if (loading) return <Loader />;
  if (!profile) return <p>Profile not found</p>;

  // ✅ FIXED: Agar Employee hai, toh Employee Table ka naam use karo
  const displayName = role === 'EMPLOYEE' ? (extra?.name || profile.name) : profile.name;
  const initial = (displayName || profile.username || '?').charAt(0).toUpperCase();
  
  const tabs = [{ key: 'profile', label: '👤 Profile' }, { key: 'reports', label: '📄 Reports' }];

  return (
    <>
      <PageHeader title="My Account" subtitle="View profile and reports" />

      <div style={{ display: 'inline-flex', gap: 4, padding: 4, background: theme.colors.background, border: `1px solid ${theme.colors.border}`, borderRadius: theme.radius.md, marginBottom: 16 }}>
        {tabs.map((t) => {
          const isActive = tab === t.key;
          return <Button key={t.key} variant={isActive ? 'primary' : 'ghost'} size="sm" onClick={() => setTab(t.key)}>{t.label}</Button>;
        })}
      </div>

      {tab === 'profile' && (
        <>
          <div style={{ background: theme.colors.surface, borderRadius: theme.radius.md, border: `1px solid ${theme.colors.border}`, boxShadow: theme.shadow.sm, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
              <div className="relative group" style={{ flexShrink: 0 }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: `${theme.colors.primary}15`, border: `2px solid ${theme.colors.primary}44`, color: theme.colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, overflow: 'hidden', position: 'relative' }}>
                  {previewImage || profile.profilePhoto ? (<img src={previewImage || profile.profilePhoto} alt="DP" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />) : (initial)}
                  <div onClick={() => fileInputRef.current?.click()} style={{ position: 'absolute', inset: 0, background: theme.colors.overlay, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, cursor: 'pointer', transition: 'opacity 0.2s', color: theme.colors.textLight }} onMouseEnter={(e) => e.currentTarget.style.opacity = 1} onMouseLeave={(e) => e.currentTarget.style.opacity = 0}>
                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  </div>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" style={{ display: 'none' }} />
              </div>
              <div style={{ minWidth: 0 }}>
                {/* ✅ Yahan Employee ka Asli Naam dikhega */}
                <h3 style={{ margin: 0, fontSize: 17, color: theme.colors.text }}>{displayName}</h3>
                <p style={{ margin: '2px 0 6px', fontSize: 12, color: theme.colors.muted, fontFamily: 'monospace' }}>@{profile.username}</p>
                <Badge variant="info">{profile.role?.replace('_', ' ')}</Badge>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 14 }}>
              <Input label="Mobile" value={form.mobile} onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value }))} placeholder="9876543210" />
              {!emailEdit && form.email ? (
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: theme.colors.text, marginBottom: 6 }}>Email</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', border: `1px solid ${theme.colors.border}`, borderRadius: theme.radius.md, background: theme.colors.background, fontSize: 14, minHeight: 41 }}>
                    <span style={{ flex: 1, color: theme.colors.text, wordBreak: 'break-all' }}>{form.email}</span>
                    <button type="button" onClick={() => setEmailEdit(true)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 12, color: theme.colors.primary, fontWeight: 700, padding: 0 }}>✏️ Edit</button>
                  </div>
                </div>
              ) : (<Input label="Email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="you@example.com" />)}
            </div>
            <Button onClick={handleSave} loading={saving}>💾 Save Changes</Button>
          </div>

          {role === 'EMPLOYEE' && extra && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginTop: 20 }}>
              <div style={{ background: theme.colors.surface, borderRadius: theme.radius.md, border: `1px solid ${theme.colors.border}`, boxShadow: theme.shadow.sm, padding: 20 }}>
                <SectionTitle>👤 Personal & Work Info</SectionTitle>
                <InfoRow label="Employee Code" value={extra.employeeCode} mono />
                <InfoRow label="Designation" value={extra.designation} />
                <InfoRow label="Joining Date" value={extra.joiningDate ? new Date(extra.joiningDate).toLocaleDateString('en-IN') : '—'} />
                <InfoRow label="Panchayat" value={extra.workLocation?.panchayat} />
                <InfoRow label="Aadhaar Number" value={extra.aadhaarNumber} mono />
                <InfoRow label="Mobile" value={extra.mobile} mono />
                <InfoRow label="Status" value={<Badge variant={extra.status === 'ACTIVE' ? 'success' : 'danger'}>{extra.status}</Badge>} />
              </div>
              <div style={{ background: theme.colors.surface, borderRadius: theme.radius.md, border: `1px solid ${theme.colors.border}`, boxShadow: theme.shadow.sm, padding: 20 }}>
                <SectionTitle>🏦 Bank Details</SectionTitle>
                <InfoRow label="Bank Name" value={extra.bankDetails?.bankName} />
                <InfoRow label="Account Number" value={extra.bankDetails?.accountNumber} mono />
                <InfoRow label="Branch" value={extra.bankDetails?.branch} />
                <InfoRow label="IFSC Code" value={extra.bankDetails?.ifsc} mono />
              </div>
            </div>
          )}

          {role === 'CLF' && extra && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginTop: 20 }}>
              
              <div style={{ background: theme.colors.surface, borderRadius: theme.radius.md, border: `1px solid ${theme.colors.border}`, boxShadow: theme.shadow.sm, padding: 20 }}>
                <SectionTitle>🏛️ CLF Information</SectionTitle>
                <InfoRow label="CLF Name" value={extra.name} />
                <InfoRow label="CLF Code" value={extra.code} mono />
                <InfoRow label="Block" value={extra.blockId?.name || '—'} />
                <InfoRow label="Village" value={extra.village} />
                <InfoRow label="Contact" value={extra.contact} mono />
                <InfoRow label="Status" value={<Badge variant={extra.status === 'ACTIVE' ? 'success' : 'danger'}>{extra.status}</Badge>} />
              </div>

              <div style={{ background: theme.colors.surface, borderRadius: theme.radius.md, border: `1px solid ${theme.colors.border}`, boxShadow: theme.shadow.sm, padding: 20 }}>
                <SectionTitle>📄 Letterhead & Footer (PDF)</SectionTitle>
                <InfoRow label="Title (CLF Name)" value={extra.name} />
                <InfoRow label="Address Line" value={extra.letterhead?.addressLine} />
                <InfoRow label="Reg. No." value={extra.letterhead?.registrationNo} mono />
                <InfoRow label="Signatures" value={`${extra.signatures?.first || '-'} | ${extra.signatures?.second || '-'} | ${extra.signatures?.third || '-'}`} />
                <InfoRow label="Left Logo" value={extra.letterhead?.leftLogo ? '✅ Uploaded' : '❌ Not Set'} />
                <InfoRow label="Right Logo" value={extra.letterhead?.rightLogo ? '✅ Uploaded' : '❌ Not Set'} />
              </div>

              <div style={{ background: theme.colors.surface, borderRadius: theme.radius.md, border: `1px solid ${theme.colors.border}`, boxShadow: theme.shadow.sm, padding: 20 }}>
                <SectionTitle>🏦 CLF Bank Accounts</SectionTitle>
                {!extra.bankAccounts || extra.bankAccounts.length === 0 ? (
                  <p style={{ fontSize: 13, color: theme.colors.muted, margin: 0 }}>No bank accounts added. Click "Edit Details" below to add.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {extra.bankAccounts.map((bank, i) => (
                      <div key={i} style={{ padding: '10px 12px', background: theme.colors.background, borderRadius: 8, border: `1px solid ${theme.colors.border}` }}>
                        <div style={{ fontWeight: 600, color: theme.colors.text, fontSize: 13 }}>{bank.accountName}</div>
                        <div style={{ fontSize: 12, color: theme.colors.muted, marginTop: 2 }}>
                          <strong>{bank.bankName}</strong> | A/c: <span style={{ fontFamily: 'monospace' }}>{bank.accountNumber}</span>
                        </div>
                        <div style={{ fontSize: 11, color: theme.colors.muted, marginTop: 2 }}>
                          Branch: {bank.branch || '—'} | IFSC: {bank.ifscCode || '—'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ background: theme.colors.surface, borderRadius: theme.radius.md, border: `1px solid ${theme.colors.border}`, boxShadow: theme.shadow.sm, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, borderBottom: `1px solid ${theme.colors.border}`, paddingBottom: 8 }}>
                  <SectionTitle style={{ margin: 0, border: 'none', padding: 0 }}>👥 Members Info</SectionTitle>
                  <Button size="sm" onClick={() => setOpenBodModal(true)}>✏️ Edit Details</Button>
                </div>

                <h4 style={{ margin: '0 0 10px', fontSize: 13, color: theme.colors.muted, textTransform: 'uppercase' }}>Core Members</h4>
                {['president', 'secretary', 'treasurer'].map(key => {
                  const labels = { president: 'अध्यक्ष (President)', secretary: 'सचिव (Secretary)', treasurer: 'कोषाध्यक्ष (Treasurer)' };
                  const member = extra.coreMembers?.[key] || {};
                  return (
                    <div key={key} style={{ marginBottom: 12, background: theme.colors.background, padding: 12, borderRadius: 8 }}>
                      <p style={{ margin: '0 0 4px', fontWeight: 600, color: theme.colors.text }}>{labels[key]}</p>
                      <p style={{ margin: '0 0 2px', fontSize: 13, color: theme.colors.muted }}>Name: {member.name || extra[key] || '—'}</p>
                      <p style={{ margin: '0 0 2px', fontSize: 13, color: theme.colors.muted }}>Mobile: {member.mobile || '—'}</p>
                      <p style={{ margin: '0 0 2px', fontSize: 13, color: theme.colors.muted }}>Bank: {member.bankDetails?.bankName || '—'} (A/c: {member.bankDetails?.accountNumber || '—'})</p>
                    </div>
                  );
                })}

                <h4 style={{ margin: '20px 0 10px', fontSize: 13, color: theme.colors.muted, textTransform: 'uppercase' }}>Board of Directors (BOD)</h4>
                {!extra.bodMembers || extra.bodMembers.length === 0 ? (<p style={{ fontSize: 13, color: theme.colors.muted, margin: 0 }}>No BOD members added.</p>) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {extra.bodMembers.map((member, i) => (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', padding: '10px 12px', background: theme.colors.background, borderRadius: 8, border: `1px solid ${theme.colors.border}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 600, color: theme.colors.text, fontSize: 13 }}>{member.name}</div>
                            <div style={{ fontSize: 11, color: theme.colors.muted }}>{member.designation}</div>
                          </div>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <span style={{ fontSize: 13, color: theme.colors.text, fontWeight: 500 }}>{member.mobile || '—'}</span>
                            <Button size="sm" variant="ghost" onClick={() => setSelectedMember(member)}>View Details</Button>
                          </div>
                        </div>
                        {member.address && <div style={{ fontSize: 11, color: theme.colors.muted, marginTop: 4 }}>Address: {member.address}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div style={{ marginTop: 24, background: theme.colors.surface, borderRadius: theme.radius.md, border: `1px solid ${theme.colors.border}`, boxShadow: theme.shadow.sm, padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div><h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: theme.colors.text }}>🚪 Logout</h3><p style={{ margin: '4px 0 0', fontSize: 12, color: theme.colors.muted }}>Sign out of your account on this device</p></div>
            <Button variant="danger" onClick={handleLogout} loading={loggingOut}>Logout</Button>
          </div>
        </>
      )}

      {tab === 'reports' && (<div style={{ marginTop: 8 }}><ReportsPage /></div>)}

      <Modal open={openBodModal} onClose={() => setOpenBodModal(false)} title="Manage Profile, Letterhead & Members">
        <ClfBodModal 
          clf={extra} 
          onClose={() => setOpenBodModal(false)} 
          onUpdated={() => {
            load();
            getClf(extra._id).then(({ data }) => {
              const updatedName = data.data.name;
              const stored = getAuthUser() || {};
              setAuthUser({ ...stored, name: updatedName });
              setProfile(prev => ({ ...prev, name: updatedName }));
              window.dispatchEvent(new Event('storage')); 
            }).catch(console.error);
          }} 
        />
      </Modal>

      <Modal open={!!selectedMember} onClose={() => setSelectedMember(null)} title="Member Details">
        {selectedMember && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <InfoRow label="Name" value={selectedMember.name} />
            <InfoRow label="Designation" value={selectedMember.designation} />
            <InfoRow label="Mobile" value={selectedMember.mobile} />
            <InfoRow label="Address" value={selectedMember.address} />
            <InfoRow label="Bank Name" value={selectedMember.bankDetails?.bankName} />
            <InfoRow label="Bank A/c No" value={selectedMember.bankDetails?.accountNumber} />
            <InfoRow label="IFSC Code" value={selectedMember.bankDetails?.ifscCode} />
            <InfoRow label="Branch" value={selectedMember.bankDetails?.branch} />
            <InfoRow label="Status" value={<Badge variant={selectedMember.status === 'ACTIVE' ? 'success' : 'danger'}>{selectedMember.status}</Badge>} />
          </div>
        )}
      </Modal>
    </>
  );
}

function SectionTitle({ children, style }) {
  return <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 800, color: theme.colors.primary, textTransform: 'uppercase', letterSpacing: 0.5, paddingBottom: 8, borderBottom: `1px solid ${theme.colors.border}`, ...style }}>{children}</h3>;
}

function InfoRow({ label, value, mono }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '10px 0', borderBottom: `1px solid ${theme.colors.border}`, fontSize: 13, alignItems: 'center' }}>
      <span style={{ color: theme.colors.muted, fontWeight: 600, fontSize: 12, minWidth: 110 }}>{label}</span>
      <span style={{ color: theme.colors.text, fontFamily: mono ? 'monospace' : 'inherit', fontWeight: 600, wordBreak: 'break-all', flex: 1 }}>{value || '—'}</span>
    </div>
  );
}