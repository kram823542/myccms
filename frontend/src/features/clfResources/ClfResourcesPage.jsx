// import { useEffect, useRef, useState } from 'react';
// import PageHeader from '../../components/common/PageHeader.jsx';
// import Button from '../../components/ui/Button.jsx';
// import Modal from '../../components/ui/Modal.jsx';
// import Loader from '../../components/ui/Loader.jsx';
// import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
// import Input from '../../components/ui/Input.jsx';
// import Select from '../../components/ui/Select.jsx';
// import Badge from '../../components/ui/Badge.jsx';
// import LokosCrpForm from './LokosCrpForm.jsx';
// import VoForm from './VoForm.jsx';
// import { getAuthUser } from '../../utils/authStorage.js';
// import { theme } from '../../config/theme.js';
// import * as api from './clfResources.api.js';
// import toast from 'react-hot-toast';

// export default function ClfResourcesPage() {
//   const user = getAuthUser() || {};
//   const canWrite = user.role === 'CLF' || user.role === 'SUPER_ADMIN';

//   const [tab, setTab] = useState('lokos');

//   return (
//     <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 12px' }}>
//       <PageHeader title="CLF Resources" subtitle="Lokos CRP and VO management" />

//       {/* Sliding Tabs */}
//       <div style={{ position: 'relative', display: 'flex', background: theme.colors.background, border: `1px solid ${theme.colors.border}`, borderRadius: 999, padding: 4, marginBottom: 20, boxShadow: theme.shadow.sm, maxWidth: 400 }}>
//         <div style={{ position: 'absolute', top: 4, bottom: 4, left: tab === 'lokos' ? 4 : '50%', width: 'calc(50% - 4px)', background: theme.colors.primary, borderRadius: 999, transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)', zIndex: 1 }} />
//         {[{ key: 'lokos', label: '👥 Lokos CRP' }, { key: 'vos', label: '🏘️ Village Organizations' }].map((t) => (
//           <button key={t.key} onClick={() => setTab(t.key)} style={{ flex: 1, position: 'relative', zIndex: 2, padding: '8px 12px', border: 'none', background: 'transparent', color: tab === t.key ? theme.colors.textLight : theme.colors.muted, fontWeight: 700, fontSize: 12, cursor: 'pointer', borderRadius: 999 }}>
//             {t.label}
//           </button>
//         ))}
//       </div>

//       {tab === 'lokos' && <LokosTab canWrite={canWrite} />}
//       {tab === 'vos' && <VosTab canWrite={canWrite} />}
//     </div>
//   );
// }

// /* ═══════════════ 3-DOT MENU COMPONENT ═══════════════ */
// function ActionMenu({ item, onEdit, onView, onDelete, canWrite }) {
//   const [open, setOpen] = useState(false);
//   const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
//   const btnRef = useRef(null);
//   const menuRef = useRef(null);

//   useEffect(() => {
//     const handler = (e) => {
//       if (menuRef.current && !menuRef.current.contains(e.target) && btnRef.current && !btnRef.current.contains(e.target)) {
//         setOpen(false);
//       }
//     };
//     document.addEventListener('mousedown', handler);
//     return () => document.removeEventListener('mousedown', handler);
//   }, []);

//   const handleOpen = () => {
//     if (btnRef.current) {
//       const rect = btnRef.current.getBoundingClientRect();
//       setMenuPos({ top: rect.bottom + window.scrollY + 6, left: rect.left + window.scrollX - 140 });
//     }
//     setOpen(!open);
//   };

//   return (
//     <div style={{ position: 'relative' }}>
//       <button ref={btnRef} onClick={handleOpen} style={{ background: open ? theme.colors.background : 'transparent', border: `1px solid ${theme.colors.border}`, borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: theme.colors.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
//       </button>

//       {open && (
//         <div ref={menuRef} style={{ position: 'fixed', top: menuPos.top, left: menuPos.left, background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: 12, boxShadow: theme.shadow.lg, minWidth: 160, zIndex: 9999, padding: 6 }}>
//           <MenuItem icon="👁️" label="View Details" onClick={() => { setOpen(false); onView(item); }} color={theme.colors.text} />
//           {canWrite && (
//             <>
//               <MenuItem icon="✏️" label="Edit" onClick={() => { setOpen(false); onEdit(item); }} color={theme.colors.text} />
//               <MenuItem icon="🗑️" label="Delete" onClick={() => { setOpen(false); onDelete(item); }} color={theme.colors.danger} />
//             </>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// function MenuItem({ icon, label, color, onClick }) {
//   return (
//     <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 10px', background: 'transparent', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color }}>
//       <span style={{ fontSize: 14 }}>{icon}</span>
//       {label}
//     </button>
//   );
// }

// /* ═══════════════ LOKOS TAB ═══════════════ */
// function LokosTab({ canWrite }) {
//   const [items, setItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState('');
//   const [desigFilter, setDesigFilter] = useState('');
//   const [bankFilter, setBankFilter] = useState('');
  
//   const [selectedIds, setSelectedIds] = useState([]);
//   const [formOpen, setFormOpen] = useState(false);
//   const [editTarget, setEditTarget] = useState(null);
//   const [viewTarget, setViewTarget] = useState(null);
//   const [deleteTarget, setDeleteTarget] = useState(null);
//   const [saving, setSaving] = useState(false);
//   const [deleting, setDeleting] = useState(false);

//   const load = async () => {
//     setLoading(true);
//     try {
//       const { data } = await api.listLokos({ search });
//       setItems(data.data.lokosCrps || []);
//     } catch (err) {
//       toast.error('Failed to load Lokos CRPs');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { load(); }, [search]);

//   const handleSave = async (form) => {
//     setSaving(true);
//     try {
//       if (editTarget) {
//         await api.updateLokos(editTarget._id, form);
//         toast.success('Lokos CRP updated');
//       } else {
//         await api.createLokos(form);
//         toast.success('Lokos CRP added');
//       }
//       setFormOpen(false);
//       setEditTarget(null);
//       load();
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleDelete = async () => {
//     if (!deleteTarget) return;
//     setDeleting(true);
//     try {
//       await api.deleteLokos(deleteTarget._id);
//       toast.success('Lokos CRP deleted permanently');
//       setDeleteTarget(null);
//       load();
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Failed to delete');
//     } finally {
//       setDeleting(false);
//     }
//   };

//   // ✅ Filters Logic
//   const uniqueDesignations = [...new Set(items.map(i => i.designation).filter(Boolean))];
//   const uniqueBanks = [...new Set(items.map(i => i.bankName).filter(Boolean))];

//   const filteredItems = items.filter(item => {
//     if (desigFilter && item.designation !== desigFilter) return false;
//     if (bankFilter && item.bankName !== bankFilter) return false;
//     return true;
//   });

//   const toggleSelect = (id) => {
//     setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
//   };

//   const toggleSelectAll = () => {
//     if (selectedIds.length === filteredItems.length) setSelectedIds([]);
//     else setSelectedIds(filteredItems.map(i => i._id));
//   };

//   return (
//     <>
//       {/* Filters Bar */}
//       <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'flex-end', background: theme.colors.surface, padding: 12, borderRadius: theme.radius.md, border: `1px solid ${theme.colors.border}` }}>
//         <div style={{ flex: 1, minWidth: 200 }}>
//           <Input placeholder="Search name, mobile, village..." value={search} onChange={(e) => setSearch(e.target.value)} />
//         </div>
//         <div style={{ width: 160 }}>
//           <Select value={desigFilter} onChange={(e) => setDesigFilter(e.target.value)} options={uniqueDesignations.map(d => ({ value: d, label: d }))} placeholder="All Designations" />
//         </div>
//         <div style={{ width: 160 }}>
//           <Select value={bankFilter} onChange={(e) => setBankFilter(e.target.value)} options={uniqueBanks.map(b => ({ value: b, label: b }))} placeholder="All Banks" />
//         </div>
//         {canWrite && (
//           <Button onClick={() => { setEditTarget(null); setFormOpen(true); }}>+ Add Lokos CRP</Button>
//         )}
//       </div>

//       {/* Selected Counter (Advice generate feature ke liye future ready) */}
//       {selectedIds.length > 0 && (
//         <div style={{ padding: '10px 14px', background: `${theme.colors.primary}10`, border: `1px solid ${theme.colors.primary}30`, borderRadius: 8, marginBottom: 12, fontSize: 13, color: theme.colors.primary, fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//           <span>✅ {selectedIds.length} Lokos CRP selected</span>
//           <Button size="sm" onClick={() => toast.success('Advice Generate feature coming soon!')}>Generate Advice</Button>
//         </div>
//       )}

//       {loading ? (
//         <Loader />
//       ) : filteredItems.length === 0 ? (
//         <div style={{ padding: 40, background: theme.colors.surface, borderRadius: theme.radius.md, textAlign: 'center', color: theme.colors.muted }}>
//           No Lokos CRPs found.
//         </div>
//       ) : (
//         <div style={{ background: theme.colors.surface, borderRadius: theme.radius.md, boxShadow: theme.shadow.sm, border: `1px solid ${theme.colors.border}`, overflowX: 'auto' }}>
//           <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
//             <thead>
//               <tr style={{ background: theme.colors.background }}>
//                 <th style={{ padding: '12px 14px', width: 40, textAlign: 'center' }}>
//                   <input type="checkbox" checked={selectedIds.length === filteredItems.length && filteredItems.length > 0} onChange={toggleSelectAll} style={{ cursor: 'pointer', width: 16, height: 16 }} />
//                 </th>
//                 {['Name', 'Village', 'Designation', 'Mobile', 'Bank Details', 'Status', 'Actions'].map((h) => (
//                   <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 700, fontSize: 11, color: theme.colors.muted, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {filteredItems.map((item) => (
//                 <tr key={item._id} style={{ borderBottom: `1px solid ${theme.colors.border}`, background: selectedIds.includes(item._id) ? `${theme.colors.primary}05` : 'transparent' }}>
//                   <td style={{ padding: '12px 14px', textAlign: 'center' }}>
//                     <input type="checkbox" checked={selectedIds.includes(item._id)} onChange={() => toggleSelect(item._id)} style={{ cursor: 'pointer', width: 16, height: 16 }} />
//                   </td>
//                   <td style={{ padding: '12px 14px', fontWeight: 600, color: theme.colors.text }}>{item.name}</td>
//                   <td style={{ padding: '12px 14px', color: theme.colors.text }}>{item.village || '—'}</td>
//                   <td style={{ padding: '12px 14px', color: theme.colors.muted, fontSize: 12 }}>
//                     <span style={{ padding: '2px 8px', background: theme.colors.background, borderRadius: 4, border: `1px solid ${theme.colors.border}` }}>{item.designation || '—'}</span>
//                   </td>
//                   <td style={{ padding: '12px 14px', fontFamily: 'monospace', color: theme.colors.text }}>{item.mobile}</td>
//                   <td style={{ padding: '12px 14px', color: theme.colors.muted, fontSize: 12 }}>
//                     {item.bankName ? (
//                       <div>
//                         <div style={{ fontWeight: 600, color: theme.colors.text }}>{item.bankName}</div>
//                         <div style={{ fontFamily: 'monospace' }}>{item.accountNumber}</div>
//                         <div style={{ fontFamily: 'monospace', fontSize: 11 }}>IFSC: {item.ifscCode}</div>
//                       </div>
//                     ) : '—'}
//                   </td>
//                   <td style={{ padding: '12px 14px' }}>
//                     <Badge variant={item.status === 'ACTIVE' ? 'success' : 'danger'}>{item.status}</Badge>
//                   </td>
//                   <td style={{ padding: '12px 14px' }}>
//                     <ActionMenu 
//                       item={item} 
//                       canWrite={canWrite}
//                       onEdit={(i) => { setEditTarget(i); setFormOpen(true); }} 
//                       onView={(i) => setViewTarget(i)} 
//                       onDelete={(i) => setDeleteTarget(i)} 
//                     />
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* Add/Edit Modal */}
//       <Modal open={formOpen} onClose={() => { setFormOpen(false); setEditTarget(null); }} title={editTarget ? 'Edit Lokos CRP' : 'Add Lokos CRP'} size="md">
//         <LokosCrpForm initial={editTarget} onSave={handleSave} onCancel={() => { setFormOpen(false); setEditTarget(null); }} saving={saving} />
//       </Modal>

//       {/* View Details Modal */}
//       <Modal open={!!viewTarget} onClose={() => setViewTarget(null)} title="Lokos CRP Details" size="md">
//         {viewTarget && (
//           <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
//             <Row k="Name" v={viewTarget.name} />
//             <Row k="Village" v={viewTarget.village} />
//             <Row k="Designation" v={viewTarget.designation} />
//             <Row k="Mobile" v={viewTarget.mobile} mono />
//             <div style={{ paddingTop: 10, marginTop: 10, borderTop: `1px solid ${theme.colors.border}` }}>
//               <h4 style={{ margin: '0 0 8px', color: theme.colors.primary, fontSize: 13 }}>Bank Details</h4>
//               <Row k="Bank Name" v={viewTarget.bankName} />
//               <Row k="A/c No." v={viewTarget.accountNumber} mono />
//               <Row k="Branch" v={viewTarget.branch} />
//               <Row k="IFSC" v={viewTarget.ifscCode} mono />
//             </div>
//           </div>
//         )}
//       </Modal>

//       <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Lokos CRP?" message={`Are you sure you want to permanently delete "${deleteTarget?.name}"?`} confirmText="Delete Permanently" loading={deleting} variant="danger" />
//     </>
//   );
// }

// /* ═══════════════ VOS TAB ═══════════════ */
// function VosTab({ canWrite }) {
//   const [items, setItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState('');
  
//   const [selectedIds, setSelectedIds] = useState([]);
//   const [formOpen, setFormOpen] = useState(false);
//   const [editTarget, setEditTarget] = useState(null);
//   const [viewTarget, setViewTarget] = useState(null);
//   const [deleteTarget, setDeleteTarget] = useState(null);
//   const [saving, setSaving] = useState(false);
//   const [deleting, setDeleting] = useState(false);

//   const load = async () => {
//     setLoading(true);
//     try {
//       const { data } = await api.listVos({ search });
//       setItems(data.data.vos || []);
//     } catch (err) {
//       toast.error('Failed to load VOs');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { load(); }, [search]);

//   const handleSave = async (form) => {
//     setSaving(true);
//     try {
//       if (editTarget) {
//         await api.updateVo(editTarget._id, form);
//         toast.success('VO updated');
//       } else {
//         await api.createVo(form);
//         toast.success('VO added');
//       }
//       setFormOpen(false);
//       setEditTarget(null);
//       load();
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleDelete = async () => {
//     if (!deleteTarget) return;
//     setDeleting(true);
//     try {
//       await api.deleteVo(deleteTarget._id);
//       toast.success('VO deleted permanently');
//       setDeleteTarget(null);
//       load();
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Failed to delete');
//     } finally {
//       setDeleting(false);
//     }
//   };

//   const toggleSelect = (id) => {
//     setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
//   };

//   const toggleSelectAll = () => {
//     if (selectedIds.length === items.length) setSelectedIds([]);
//     else setSelectedIds(items.map(i => i._id));
//   };

//   return (
//     <>
//       <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
//         <div style={{ flex: 1, minWidth: 200, maxWidth: 320 }}>
//           <Input placeholder="Search VO name..." value={search} onChange={(e) => setSearch(e.target.value)} />
//         </div>
//         {canWrite && (
//           <Button onClick={() => { setEditTarget(null); setFormOpen(true); }}>+ Add VO</Button>
//         )}
//       </div>

//       {selectedIds.length > 0 && (
//         <div style={{ padding: '10px 14px', background: `${theme.colors.primary}10`, border: `1px solid ${theme.colors.primary}30`, borderRadius: 8, marginBottom: 12, fontSize: 13, color: theme.colors.primary, fontWeight: 600 }}>
//           ✅ {selectedIds.length} VO selected
//         </div>
//       )}

//       {loading ? (
//         <Loader />
//       ) : items.length === 0 ? (
//         <div style={{ padding: 40, background: theme.colors.surface, borderRadius: theme.radius.md, textAlign: 'center', color: theme.colors.muted }}>
//           No VOs added yet.
//         </div>
//       ) : (
//         <div style={{ background: theme.colors.surface, borderRadius: theme.radius.md, boxShadow: theme.shadow.sm, border: `1px solid ${theme.colors.border}`, overflowX: 'auto' }}>
//           <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
//             <thead>
//               <tr style={{ background: theme.colors.background }}>
//                 <th style={{ padding: '12px 14px', width: 40, textAlign: 'center' }}>
//                   <input type="checkbox" checked={selectedIds.length === items.length && items.length > 0} onChange={toggleSelectAll} style={{ cursor: 'pointer', width: 16, height: 16 }} />
//                 </th>
//                 {['VO Name', 'Bank Details', 'Sachiv (सचिव)', 'Adhyaksh (अध्यक्ष)', 'Kosha Adhyaksh', 'Status', 'Actions'].map((h) => (
//                   <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 700, fontSize: 11, color: theme.colors.muted, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {items.map((vo) => (
//                 <tr key={vo._id} style={{ borderBottom: `1px solid ${theme.colors.border}`, background: selectedIds.includes(vo._id) ? `${theme.colors.primary}05` : 'transparent' }}>
//                   <td style={{ padding: '12px 14px', textAlign: 'center' }}>
//                     <input type="checkbox" checked={selectedIds.includes(vo._id)} onChange={() => toggleSelect(vo._id)} style={{ cursor: 'pointer', width: 16, height: 16 }} />
//                   </td>
//                   <td style={{ padding: '12px 14px', fontWeight: 600, color: theme.colors.text }}>{vo.voName}</td>
//                   <td style={{ padding: '12px 14px', color: theme.colors.muted, fontSize: 12 }}>
//                     {vo.bankName ? (
//                       <div>
//                         <div style={{ fontWeight: 600, color: theme.colors.text }}>{vo.bankName}</div>
//                         <div style={{ fontFamily: 'monospace' }}>{vo.accountNumber}</div>
//                         <div style={{ fontFamily: 'monospace', fontSize: 11 }}>IFSC: {vo.ifscCode}</div>
//                       </div>
//                     ) : '—'}
//                   </td>
                  
//                   {/* Members Info */}
//                   <td style={{ padding: '12px 14px', fontSize: 12 }}>
//                     {vo.sachiv?.name ? <div><b>{vo.sachiv.name}</b><br/><span style={{color: theme.colors.muted}}>{vo.sachiv.village} | {vo.sachiv.phone}</span></div> : '—'}
//                   </td>
//                   <td style={{ padding: '12px 14px', fontSize: 12 }}>
//                     {vo.adhyaksh?.name ? <div><b>{vo.adhyaksh.name}</b><br/><span style={{color: theme.colors.muted}}>{vo.adhyaksh.village} | {vo.adhyaksh.phone}</span></div> : '—'}
//                   </td>
//                   <td style={{ padding: '12px 14px', fontSize: 12 }}>
//                     {vo.koshaAdhyaksh?.name ? <div><b>{vo.koshaAdhyaksh.name}</b><br/><span style={{color: theme.colors.muted}}>{vo.koshaAdhyaksh.village} | {vo.koshaAdhyaksh.phone}</span></div> : '—'}
//                   </td>

//                   <td style={{ padding: '12px 14px' }}>
//                     <Badge variant={vo.status === 'ACTIVE' ? 'success' : 'danger'}>{vo.status}</Badge>
//                   </td>
//                   <td style={{ padding: '12px 14px' }}>
//                     <ActionMenu 
//                       item={vo} 
//                       canWrite={canWrite}
//                       onEdit={(i) => { setEditTarget(i); setFormOpen(true); }} 
//                       onView={(i) => setViewTarget(i)} 
//                       onDelete={(i) => setDeleteTarget(i)} 
//                     />
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       <Modal open={formOpen} onClose={() => { setFormOpen(false); setEditTarget(null); }} title={editTarget ? 'Edit VO' : 'Add VO'} size="lg">
//         <VoForm initial={editTarget} onSave={handleSave} onCancel={() => { setFormOpen(false); setEditTarget(null); }} saving={saving} />
//       </Modal>

//       <Modal open={!!viewTarget} onClose={() => setViewTarget(null)} title={`VO Details — ${viewTarget?.voName}`} size="md">
//         {viewTarget && (
//           <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
//             <div style={{ padding: 12, background: theme.colors.background, borderRadius: 8, border: `1px solid ${theme.colors.border}` }}>
//               <h4 style={{ margin: '0 0 8px', color: theme.colors.primary, fontSize: 13 }}>VO Bank Account</h4>
//               <Row k="Bank Name" v={viewTarget.bankName} />
//               <Row k="A/c No." v={viewTarget.accountNumber} mono />
//               <Row k="Branch" v={viewTarget.branch} />
//               <Row k="IFSC" v={viewTarget.ifscCode} mono />
//             </div>
//             <MemberDetail label="सचिव (Sachiv)" data={viewTarget.sachiv} />
//             <MemberDetail label="अध्यक्ष (Adhyaksh)" data={viewTarget.adhyaksh} />
//             <MemberDetail label="कोषाध्यक्ष (Kosha Adhyaksh)" data={viewTarget.koshaAdhyaksh} />
//           </div>
//         )}
//       </Modal>

//       <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete VO?" message={`Are you sure you want to permanently delete "${deleteTarget?.voName}"?`} confirmText="Delete Permanently" loading={deleting} variant="danger" />
//     </>
//   );
// }

// function MemberDetail({ label, data }) {
//   return (
//     <div style={{ padding: 12, background: theme.colors.background, borderRadius: 8, border: `1px solid ${theme.colors.border}` }}>
//       <h4 style={{ margin: '0 0 8px', color: theme.colors.primary, fontSize: 13 }}>{label}</h4>
//       <Row k="Name" v={data?.name} />
//       <Row k="Village" v={data?.village} />
//       <Row k="Phone" v={data?.phone} mono />
//     </div>
//   );
// }

// function Row({ k, v, mono }) {
//   return (
//     <div style={{ display: 'flex', gap: 8, padding: '4px 0', fontSize: 12 }}>
//       <span style={{ color: theme.colors.muted, minWidth: 70 }}>{k}:</span>
//       <span style={{ color: theme.colors.text, fontFamily: mono ? 'monospace' : 'inherit', flex: 1, wordBreak: 'break-all' }}>{v || '—'}</span>
//     </div>
//   );
// }


import { useEffect, useRef, useState } from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Loader from '../../components/ui/Loader.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import Input from '../../components/ui/Input.jsx';
import Select from '../../components/ui/Select.jsx';
import Badge from '../../components/ui/Badge.jsx';
import LokosCrpForm from './LokosCrpForm.jsx';
import VoForm from './VoForm.jsx';
import { getAuthUser } from '../../utils/authStorage.js';
import { theme } from '../../config/theme.js';
import * as api from './clfResources.api.js';
import { getClf } from '../clfs/clfs.api.js'; 
import apiClient from '../../services/apiClient.js'; 
import toast from 'react-hot-toast';

// ✅ Yahan hum frontend me ek chhoti utility call kar rahe hain (jo backend jaisi hi hai)
// Agar aapne backend me file banayi hai, toh frontend me bhi ek file banao
import { generatePatrankPrefix } from '../../utils/patrankGenerator.js'; 

export default function ClfResourcesPage() {
  const user = getAuthUser() || {};
  const canWrite = user.role === 'CLF' || user.role === 'SUPER_ADMIN';

  const [tab, setTab] = useState('lokos');
  const [clfData, setClfData] = useState(null);

  useEffect(() => {
    if (user.clfId) {
      getClf(user.clfId).then(({ data }) => setClfData(data.data)).catch(console.error);
    }
  }, [user.clfId]);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 12px' }}>
      <PageHeader title="CLF Resources" subtitle="Lokos CRP and VO management" />

      <div style={{ position: 'relative', display: 'flex', background: theme.colors.background, border: `1px solid ${theme.colors.border}`, borderRadius: 999, padding: 4, marginBottom: 20, boxShadow: theme.shadow.sm, maxWidth: 400 }}>
        <div style={{ position: 'absolute', top: 4, bottom: 4, left: tab === 'lokos' ? 4 : '50%', width: 'calc(50% - 4px)', background: theme.colors.primary, borderRadius: 999, transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)', zIndex: 1 }} />
        {[{ key: 'lokos', label: '👥 Lokos CRP' }, { key: 'vos', label: '🏘️ Village Organizations' }].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ flex: 1, position: 'relative', zIndex: 2, padding: '8px 12px', border: 'none', background: 'transparent', color: tab === t.key ? theme.colors.textLight : theme.colors.muted, fontWeight: 700, fontSize: 12, cursor: 'pointer', borderRadius: 999 }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'lokos' && <LokosTab canWrite={canWrite} clfData={clfData} />}
      {tab === 'vos' && <VosTab canWrite={canWrite} clfData={clfData} />}
    </div>
  );
}

/* ═══════════════ 3-DOT MENU COMPONENT ═══════════════ */
function ActionMenu({ item, onEdit, onView, onDelete, canWrite }) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) && btnRef.current && !btnRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setMenuPos({ top: rect.bottom + window.scrollY + 6, left: rect.left + window.scrollX - 140 });
    }
    setOpen(!open);
  };

  return (
    <div style={{ position: 'relative' }}>
      <button ref={btnRef} onClick={handleOpen} style={{ background: open ? theme.colors.background : 'transparent', border: `1px solid ${theme.colors.border}`, borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: theme.colors.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
      </button>

      {open && (
        <div ref={menuRef} style={{ position: 'fixed', top: menuPos.top, left: menuPos.left, background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: 12, boxShadow: theme.shadow.lg, minWidth: 160, zIndex: 9999, padding: 6 }}>
          <MenuItem icon="👁️" label="View Details" onClick={() => { setOpen(false); onView(item); }} color={theme.colors.text} />
          {canWrite && (
            <>
              <MenuItem icon="✏️" label="Edit" onClick={() => { setOpen(false); onEdit(item); }} color={theme.colors.text} />
              <MenuItem icon="🗑️" label="Delete" onClick={() => { setOpen(false); onDelete(item); }} color={theme.colors.danger} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function MenuItem({ icon, label, color, onClick }) {
  return (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 10px', background: 'transparent', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color }}>
      <span style={{ fontSize: 14 }}>{icon}</span>
      {label}
    </button>
  );
}

/* ═══════════════ ADVICE MODAL COMPONENT ═══════════════ */
function GenerateAdviceModal({ isOpen, onClose, type, selectedItems, clfData }) {
  const [adviceDate, setAdviceDate] = useState(new Date().toISOString().split('T')[0]);
  const [adviceNumber, setAdviceNumber] = useState('');
  const [selectedBankAcc, setSelectedBankAcc] = useState('');
  const [entries, setEntries] = useState([]);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAdviceDate(new Date().toISOString().split('T')[0]);
      
      // ✅ Auto-fetch using Utility (No Hardcode)
      if (clfData?.name) {
        const prefix = generatePatrankPrefix(clfData.name);
        const currentYear = new Date().getFullYear();
        setAdviceNumber(`${prefix}/CLF/${currentYear}/`); 
      } else {
        setAdviceNumber('');
      }

      if (clfData?.bankAccounts?.length > 0) {
        setSelectedBankAcc(clfData.bankAccounts[0].accountNumber);
      }

      const initialEntries = selectedItems.map(item => ({
        ...item,
        amount: '', 
        monthValue: 'Nov26'
      }));
      setEntries(initialEntries);
    }
  }, [isOpen, clfData, selectedItems]);

  const totalAmount = entries.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

  const handleEntryChange = (idx, field, value) => {
    setEntries(prev => prev.map((e, i) => i === idx ? { ...e, [field]: value } : e));
  };











   const handleGenerate = async () => {
    if (!selectedBankAcc) return toast.error('Please select a CLF Bank Account');
    if (entries.some(e => !e.amount || parseFloat(e.amount) <= 0)) {
      return toast.error('Please enter a valid Amount for all selected items');
    }

    const selectedBankObj = clfData?.bankAccounts?.find(b => b.accountNumber === selectedBankAcc);
    if (!selectedBankObj) return toast.error('Invalid Bank Account selected');

    setGenerating(true);
    try {
      const response = await apiClient.post(
        '/clf-resources/generate-advice',
        {
          type,
          ids: selectedItems.map(i => i._id),
          month: entries[0].monthValue || 'Nov26',
          adviceDate,
          adviceNumber: adviceNumber, 
          // ✅ Ensure array of numbers
          amounts: entries.map(e => parseFloat(e.amount)), 
          selectedBank: selectedBankObj,
        },
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const safeName = adviceNumber ? adviceNumber.replace(/\//g, '-') : 'Auto';
      link.setAttribute('download', `Advice-${type}-${safeName}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Advice Generated!');
      onClose();
    } catch (err) {
      console.error(err);
      if (err.response?.data instanceof Blob) {
        const text = await err.response.data.text();
        try {
          const json = JSON.parse(text);
          toast.error(json.message || 'Failed to generate advice');
        } catch(e) {
          toast.error('Failed to generate advice');
        }
      } else {
        toast.error(err.response?.data?.message || 'Failed to generate advice');
      }
    } finally {
      setGenerating(false);
    }
  };












  if (!clfData) {
    return (
      <Modal open={isOpen} onClose={onClose} title="Loading...">
         <div style={{ padding: 40, textAlign: 'center' }}><Loader /></div>
      </Modal>
    );
  }

  return (
    <Modal open={isOpen} onClose={onClose} title={`Enter Month & Amount (${entries.length} Selected)`} size="lg">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 10 }}>
        
        <div style={{ padding: 12, background: theme.colors.background, borderRadius: theme.radius.sm, border: `1px solid ${theme.colors.border}` }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: theme.colors.primary, marginBottom: 8 }}>
            Select CLF Bank Account *
          </label>
          <Select
            value={selectedBankAcc}
            onChange={(e) => setSelectedBankAcc(e.target.value)}
            options={(clfData?.bankAccounts || []).map(b => ({
              value: b.accountNumber,
              label: `${b.accountName} - ${b.bankName} (A/c: ${b.accountNumber})`
            }))}
            placeholder="Select Bank Account"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Input 
            label="Advice Number (पत्रांक)" 
            value={adviceNumber} 
            onChange={(e) => setAdviceNumber(e.target.value)} 
            style={{ fontFamily: 'monospace' }} 
          />
          <Input label="Advice Date" type="date" value={adviceDate} onChange={(e) => setAdviceDate(e.target.value)} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="border rounded-lg p-3 flex justify-end items-center" style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border }}>
            <div className="text-right">
              <span className="block text-[10px] font-bold uppercase tracking-widest" style={{ color: theme.colors.muted }}>TOTAL</span>
              <span className="text-base font-bold font-mono" style={{ color: theme.colors.secondary }}>₹ {totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
          {entries.map((entry, idx) => (
            <div key={entry._id} className="border rounded-lg p-3" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
              <p className="text-xs font-semibold mb-2" style={{ color: theme.colors.text }}>
                {idx + 1}. {entry.name || entry.voName} <span className="text-[10px]" style={{ color: theme.colors.muted }}>({entry.designation || 'VO Member'})</span>
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Input 
                  label="Month(s) *" 
                  value={entry.monthValue} 
                  onChange={(e) => handleEntryChange(idx, 'monthValue', e.target.value)} 
                  placeholder="Nov26" 
                />
                <Input 
                  label="Amount (₹) *" 
                  type="number" 
                  value={entry.amount} 
                  onChange={(e) => handleEntryChange(idx, 'amount', e.target.value)} 
                  style={{ fontFamily: 'monospace' }} 
                />
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
          <Button onClick={handleGenerate} loading={generating} style={{ flex: 1 }}>💾 Save & Download PDF</Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </Modal>
  );
}

/* ═══════════════ LOKOS TAB ═══════════════ */
function LokosTab({ canWrite, clfData }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [desigFilter, setDesigFilter] = useState('');
  const [bankFilter, setBankFilter] = useState('');
  
  const [selectedIds, setSelectedIds] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const [adviceModalOpen, setAdviceModalOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.listLokos({ search });
      setItems(data.data.lokosCrps || []);
    } catch (err) {
      toast.error('Failed to load Lokos CRPs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [search]);

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (editTarget) {
        await api.updateLokos(editTarget._id, form);
        toast.success('Lokos CRP updated');
      } else {
        await api.createLokos(form);
        toast.success('Lokos CRP added');
      }
      setFormOpen(false);
      setEditTarget(null);
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deleteLokos(deleteTarget._id);
      toast.success('Lokos CRP deleted permanently');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const uniqueDesignations = [...new Set(items.map(i => i.designation).filter(Boolean))];
  const uniqueBanks = [...new Set(items.map(i => i.bankName).filter(Boolean))];

  const filteredItems = items.filter(item => {
    if (desigFilter && item.designation !== desigFilter) return false;
    if (bankFilter && item.bankName !== bankFilter) return false;
    return true;
  });

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredItems.length) setSelectedIds([]);
    else setSelectedIds(filteredItems.map(i => i._id));
  };

  return (
    <>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'flex-end', background: theme.colors.surface, padding: 12, borderRadius: theme.radius.md, border: `1px solid ${theme.colors.border}` }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <Input placeholder="Search name, mobile, village..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div style={{ width: 160 }}>
          <Select value={desigFilter} onChange={(e) => setDesigFilter(e.target.value)} options={uniqueDesignations.map(d => ({ value: d, label: d }))} placeholder="All Designations" />
        </div>
        <div style={{ width: 160 }}>
          <Select value={bankFilter} onChange={(e) => setBankFilter(e.target.value)} options={uniqueBanks.map(b => ({ value: b, label: b }))} placeholder="All Banks" />
        </div>
        {canWrite && (
          <Button onClick={() => { setEditTarget(null); setFormOpen(true); }}>+ Add Lokos CRP</Button>
        )}
      </div>

      {selectedIds.length > 0 && (
        <div style={{ padding: '10px 14px', background: `${theme.colors.primary}10`, border: `1px solid ${theme.colors.primary}30`, borderRadius: 8, marginBottom: 12, fontSize: 13, color: theme.colors.primary, fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>✅ {selectedIds.length} Lokos CRP selected</span>
          <Button size="sm" onClick={() => setAdviceModalOpen(true)}>Generate Advice</Button>
        </div>
      )}

      {loading ? (
        <Loader />
      ) : filteredItems.length === 0 ? (
        <div style={{ padding: 40, background: theme.colors.surface, borderRadius: theme.radius.md, textAlign: 'center', color: theme.colors.muted }}>
          No Lokos CRPs found.
        </div>
      ) : (
        <div style={{ background: theme.colors.surface, borderRadius: theme.radius.md, boxShadow: theme.shadow.sm, border: `1px solid ${theme.colors.border}`, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: theme.colors.background }}>
                <th style={{ padding: '12px 14px', width: 40, textAlign: 'center' }}>
                  <input type="checkbox" checked={selectedIds.length === filteredItems.length && filteredItems.length > 0} onChange={toggleSelectAll} style={{ cursor: 'pointer', width: 16, height: 16 }} />
                </th>
                {['Name', 'Village', 'Designation', 'Mobile', 'Bank Details', 'Status', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 700, fontSize: 11, color: theme.colors.muted, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item._id} style={{ borderBottom: `1px solid ${theme.colors.border}`, background: selectedIds.includes(item._id) ? `${theme.colors.primary}05` : 'transparent' }}>
                  <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                    <input type="checkbox" checked={selectedIds.includes(item._id)} onChange={() => toggleSelect(item._id)} style={{ cursor: 'pointer', width: 16, height: 16 }} />
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: theme.colors.text }}>{item.name}</td>
                  <td style={{ padding: '12px 14px', color: theme.colors.text }}>{item.village || '—'}</td>
                  <td style={{ padding: '12px 14px', color: theme.colors.muted, fontSize: 12 }}>
                    <span style={{ padding: '2px 8px', background: theme.colors.background, borderRadius: 4, border: `1px solid ${theme.colors.border}` }}>{item.designation || '—'}</span>
                  </td>
                  <td style={{ padding: '12px 14px', fontFamily: 'monospace', color: theme.colors.text }}>{item.mobile}</td>
                  <td style={{ padding: '12px 14px', color: theme.colors.muted, fontSize: 12 }}>
                    {item.bankName ? (
                      <div>
                        <div style={{ fontWeight: 600, color: theme.colors.text }}>{item.bankName}</div>
                        <div style={{ fontFamily: 'monospace' }}>{item.accountNumber}</div>
                        <div style={{ fontFamily: 'monospace', fontSize: 11 }}>IFSC: {item.ifscCode}</div>
                      </div>
                    ) : '—'}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <Badge variant={item.status === 'ACTIVE' ? 'success' : 'danger'}>{item.status}</Badge>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <ActionMenu 
                      item={item} 
                      canWrite={canWrite}
                      onEdit={(i) => { setEditTarget(i); setFormOpen(true); }} 
                      onView={(i) => setViewTarget(i)} 
                      onDelete={(i) => setDeleteTarget(i)} 
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={formOpen} onClose={() => { setFormOpen(false); setEditTarget(null); }} title={editTarget ? 'Edit Lokos CRP' : 'Add Lokos CRP'} size="md">
        <LokosCrpForm initial={editTarget} onSave={handleSave} onCancel={() => { setFormOpen(false); setEditTarget(null); }} saving={saving} />
      </Modal>

      <Modal open={!!viewTarget} onClose={() => setViewTarget(null)} title="Lokos CRP Details" size="md">
        {viewTarget && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Row k="Name" v={viewTarget.name} />
            <Row k="Village" v={viewTarget.village} />
            <Row k="Designation" v={viewTarget.designation} />
            <Row k="Mobile" v={viewTarget.mobile} mono />
            <div style={{ paddingTop: 10, marginTop: 10, borderTop: `1px solid ${theme.colors.border}` }}>
              <h4 style={{ margin: '0 0 8px', color: theme.colors.primary, fontSize: 13 }}>Bank Details</h4>
              <Row k="Bank Name" v={viewTarget.bankName} />
              <Row k="A/c No." v={viewTarget.accountNumber} mono />
              <Row k="Branch" v={viewTarget.branch} />
              <Row k="IFSC" v={viewTarget.ifscCode} mono />
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Lokos CRP?" message={`Are you sure you want to permanently delete "${deleteTarget?.name}"?`} confirmText="Delete Permanently" loading={deleting} variant="danger" />
      
      <GenerateAdviceModal 
        isOpen={adviceModalOpen} 
        onClose={() => setAdviceModalOpen(false)} 
        type="LOKOS" 
        selectedItems={filteredItems.filter(i => selectedIds.includes(i._id))} 
        clfData={clfData} 
      />
    </>
  );
}

/* ═══════════════ VOS TAB ═══════════════ */
function VosTab({ canWrite, clfData }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [selectedIds, setSelectedIds] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const [adviceModalOpen, setAdviceModalOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.listVos({ search });
      setItems(data.data.vos || []);
    } catch (err) {
      toast.error('Failed to load VOs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [search]);

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (editTarget) {
        await api.updateVo(editTarget._id, form);
        toast.success('VO updated');
      } else {
        await api.createVo(form);
        toast.success('VO added');
      }
      setFormOpen(false);
      setEditTarget(null);
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deleteVo(deleteTarget._id);
      toast.success('VO deleted permanently');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === items.length) setSelectedIds([]);
    else setSelectedIds(items.map(i => i._id));
  };

  return (
    <>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 200, maxWidth: 320 }}>
          <Input placeholder="Search VO name..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {canWrite && (
          <Button onClick={() => { setEditTarget(null); setFormOpen(true); }}>+ Add VO</Button>
        )}
      </div>

      {selectedIds.length > 0 && (
        <div style={{ padding: '10px 14px', background: `${theme.colors.primary}10`, border: `1px solid ${theme.colors.primary}30`, borderRadius: 8, marginBottom: 12, fontSize: 13, color: theme.colors.primary, fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>✅ {selectedIds.length} VO selected</span>
          <Button size="sm" onClick={() => setAdviceModalOpen(true)}>Generate Advice</Button>
        </div>
      )}

      {loading ? (
        <Loader />
      ) : items.length === 0 ? (
        <div style={{ padding: 40, background: theme.colors.surface, borderRadius: theme.radius.md, textAlign: 'center', color: theme.colors.muted }}>
          No VOs added yet.
        </div>
      ) : (
        <div style={{ background: theme.colors.surface, borderRadius: theme.radius.md, boxShadow: theme.shadow.sm, border: `1px solid ${theme.colors.border}`, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: theme.colors.background }}>
                <th style={{ padding: '12px 14px', width: 40, textAlign: 'center' }}>
                  <input type="checkbox" checked={selectedIds.length === items.length && items.length > 0} onChange={toggleSelectAll} style={{ cursor: 'pointer', width: 16, height: 16 }} />
                </th>
                {['VO Name', 'Bank Details', 'Sachiv (सचिव)', 'Adhyaksh (अध्यक्ष)', 'Kosha Adhyaksh', 'Status', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 700, fontSize: 11, color: theme.colors.muted, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((vo) => (
                <tr key={vo._id} style={{ borderBottom: `1px solid ${theme.colors.border}`, background: selectedIds.includes(vo._id) ? `${theme.colors.primary}05` : 'transparent' }}>
                  <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                    <input type="checkbox" checked={selectedIds.includes(vo._id)} onChange={() => toggleSelect(vo._id)} style={{ cursor: 'pointer', width: 16, height: 16 }} />
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: theme.colors.text }}>{vo.voName}</td>
                  <td style={{ padding: '12px 14px', color: theme.colors.muted, fontSize: 12 }}>
                    {vo.bankName ? (
                      <div>
                        <div style={{ fontWeight: 600, color: theme.colors.text }}>{vo.bankName}</div>
                        <div style={{ fontFamily: 'monospace' }}>{vo.accountNumber}</div>
                        <div style={{ fontFamily: 'monospace', fontSize: 11 }}>IFSC: {vo.ifscCode}</div>
                      </div>
                    ) : '—'}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 12 }}>
                    {vo.sachiv?.name ? <div><b>{vo.sachiv.name}</b><br/><span style={{color: theme.colors.muted}}>{vo.sachiv.village} | {vo.sachiv.phone}</span></div> : '—'}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 12 }}>
                    {vo.adhyaksh?.name ? <div><b>{vo.adhyaksh.name}</b><br/><span style={{color: theme.colors.muted}}>{vo.adhyaksh.village} | {vo.adhyaksh.phone}</span></div> : '—'}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 12 }}>
                    {vo.koshaAdhyaksh?.name ? <div><b>{vo.koshaAdhyaksh.name}</b><br/><span style={{color: theme.colors.muted}}>{vo.koshaAdhyaksh.village} | {vo.koshaAdhyaksh.phone}</span></div> : '—'}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <Badge variant={vo.status === 'ACTIVE' ? 'success' : 'danger'}>{vo.status}</Badge>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <ActionMenu 
                      item={vo} 
                      canWrite={canWrite}
                      onEdit={(i) => { setEditTarget(i); setFormOpen(true); }} 
                      onView={(i) => setViewTarget(i)} 
                      onDelete={(i) => setDeleteTarget(i)} 
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={formOpen} onClose={() => { setFormOpen(false); setEditTarget(null); }} title={editTarget ? 'Edit VO' : 'Add VO'} size="lg">
        <VoForm initial={editTarget} onSave={handleSave} onCancel={() => { setFormOpen(false); setEditTarget(null); }} saving={saving} />
      </Modal>

      <Modal open={!!viewTarget} onClose={() => setViewTarget(null)} title={`VO Details — ${viewTarget?.voName}`} size="md">
        {viewTarget && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ padding: 12, background: theme.colors.background, borderRadius: 8, border: `1px solid ${theme.colors.border}` }}>
              <h4 style={{ margin: '0 0 8px', color: theme.colors.primary, fontSize: 13 }}>VO Bank Account</h4>
              <Row k="Bank Name" v={viewTarget.bankName} />
              <Row k="A/c No." v={viewTarget.accountNumber} mono />
              <Row k="Branch" v={viewTarget.branch} />
              <Row k="IFSC" v={viewTarget.ifscCode} mono />
            </div>
            <MemberDetail label="सचिव (Sachiv)" data={viewTarget.sachiv} />
            <MemberDetail label="अध्यक्ष (Adhyaksh)" data={viewTarget.adhyaksh} />
            <MemberDetail label="कोषाध्यक्ष (Kosha Adhyaksh)" data={viewTarget.koshaAdhyaksh} />
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete VO?" message={`Are you sure you want to permanently delete "${deleteTarget?.voName}"?`} confirmText="Delete Permanently" loading={deleting} variant="danger" />
      
      <GenerateAdviceModal 
        isOpen={adviceModalOpen} 
        onClose={() => setAdviceModalOpen(false)} 
        type="VO" 
        selectedItems={items.filter(i => selectedIds.includes(i._id))} 
        clfData={clfData} 
      />
    </>
  );
}

function MemberDetail({ label, data }) {
  return (
    <div style={{ padding: 12, background: theme.colors.background, borderRadius: 8, border: `1px solid ${theme.colors.border}` }}>
      <h4 style={{ margin: '0 0 8px', color: theme.colors.primary, fontSize: 13 }}>{label}</h4>
      <Row k="Name" v={data?.name} />
      <Row k="Village" v={data?.village} />
      <Row k="Phone" v={data?.phone} mono />
    </div>
  );
}

function Row({ k, v, mono }) {
  return (
    <div style={{ display: 'flex', gap: 8, padding: '4px 0', fontSize: 12 }}>
      <span style={{ color: theme.colors.muted, minWidth: 70 }}>{k}:</span>
      <span style={{ color: theme.colors.text, fontFamily: mono ? 'monospace' : 'inherit', flex: 1, wordBreak: 'break-all' }}>{v || '—'}</span>
    </div>
  );
}