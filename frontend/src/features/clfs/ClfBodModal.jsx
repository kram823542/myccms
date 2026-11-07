import { useState, useEffect } from 'react';
import Input from '../../components/ui/Input.jsx';
import Select from '../../components/ui/Select.jsx';
import Button from '../../components/ui/Button.jsx';
import { theme } from '../../config/theme.js';
import { updateClfBod } from './clfs.api.js';
import toast from 'react-hot-toast';

const DESIGNATIONS = ['BOD Manager', 'CLF Manager', 'Accountant', 'MIS', 'Other'];

export default function ClfBodModal({ clf, onClose, onUpdated }) {
  const [form, setForm] = useState({
    // ✅ Name input wapas add kar diya
    name: '',
    letterhead: { addressLine: '', registrationNo: '', leftLogo: '', rightLogo: '' },
    footer: { blockOffice: '', districtOffice: '', stateOffice: '', phone: '' },
    signatures: { first: 'अध्यक्ष', second: 'सचिव', third: 'कोषाध्यक्ष' },
    bankAccounts: [],
    coreMembers: {
      president: { name: '', mobile: '', address: '', bankDetails: { bankName: '', accountNumber: '', ifscCode: '', branch: '' } },
      secretary: { name: '', mobile: '', address: '', bankDetails: { bankName: '', accountNumber: '', ifscCode: '', branch: '' } },
      treasurer: { name: '', mobile: '', address: '', bankDetails: { bankName: '', accountNumber: '', ifscCode: '', branch: '' } },
    },
    bodMembers: [],
  });

  const [loading, setLoading] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [newMember, setNewMember] = useState({ 
    designation: 'BOD Manager', name: '', mobile: '', address: '', 
    bankDetails: { bankName: '', accountNumber: '', ifscCode: '', branch: '' } 
  });

  const [newBank, setNewBank] = useState({ accountName: '', bankName: '', accountNumber: '', ifscCode: '', branch: '' });
  const [editingBankIndex, setEditingBankIndex] = useState(null);

  useEffect(() => {
    if (clf) {
      const core = clf.coreMembers || {};
      setForm({
        name: clf.name || '', // ✅ CLF ka current name load kar raha hai
        letterhead: {
          addressLine: clf.letterhead?.addressLine || '',
          registrationNo: clf.letterhead?.registrationNo || '',
          leftLogo: clf.letterhead?.leftLogo || 'https://res.cloudinary.com/dsjnikk42/image/upload/v1789380290/WhatsApp_Image_2026-09-14_at_1.07.08_PM_nbbmda.jpg',
          rightLogo: clf.letterhead?.rightLogo || 'https://res.cloudinary.com/dsjnikk42/image/upload/v1789380471/WhatsApp_Image_2026-09-14_at_1.07.10_PM_owpahi.jpg',
        },
        footer: {
          blockOffice: clf.footer?.blockOffice || '',
          districtOffice: clf.footer?.districtOffice || '',
          stateOffice: clf.footer?.stateOffice || '',
          phone: clf.footer?.phone || '',
        },
        signatures: {
          first: clf.signatures?.first || 'अध्यक्ष',
          second: clf.signatures?.second || 'सचिव',
          third: clf.signatures?.third || 'कोषाध्यक्ष',
        },
        bankAccounts: clf.bankAccounts || [],
        coreMembers: {
          president: {
            name: core.president?.name || clf.president || '',
            mobile: core.president?.mobile || '',
            address: core.president?.address || '',
            bankDetails: core.president?.bankDetails || { bankName: '', accountNumber: '', ifscCode: '', branch: '' },
          },
          secretary: {
            name: core.secretary?.name || clf.secretary || '',
            mobile: core.secretary?.mobile || '',
            address: core.secretary?.address || '',
            bankDetails: core.secretary?.bankDetails || { bankName: '', accountNumber: '', ifscCode: '', branch: '' },
          },
          treasurer: {
            name: core.treasurer?.name || clf.treasurer || '',
            mobile: core.treasurer?.mobile || '',
            address: core.treasurer?.address || '',
            bankDetails: core.treasurer?.bankDetails || { bankName: '', accountNumber: '', ifscCode: '', branch: '' },
          },
        },
        bodMembers: clf.bodMembers || [],
      });
    }
  }, [clf]);

  const handleLogoUpload = (e, side) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return toast.error('Logo must be less than 2MB');
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(prev => ({ 
        ...prev, 
        letterhead: { ...prev.letterhead, [side]: reader.result } 
      }));
      toast.success('Logo uploaded!');
    };
    reader.readAsDataURL(file);
  };

  const handleLetterheadChange = (field, value) => {
    setForm(prev => ({ ...prev, letterhead: { ...prev.letterhead, [field]: value } }));
  };
  const handleFooterChange = (field, value) => {
    setForm(prev => ({ ...prev, footer: { ...prev.footer, [field]: value } }));
  };
  const handleSignatureChange = (field, value) => {
    setForm(prev => ({ ...prev, signatures: { ...prev.signatures, [field]: value } }));
  };

  const handleCoreChange = (role, field, value) => {
    setForm((prev) => ({
      ...prev,
      coreMembers: {
        ...prev.coreMembers,
        [role]: { ...prev.coreMembers[role], [field]: value }
      }
    }));
  };

  const handleCoreBankChange = (role, field, value) => {
    setForm((prev) => ({
      ...prev,
      coreMembers: {
        ...prev.coreMembers,
        [role]: {
          ...prev.coreMembers[role],
          bankDetails: { ...prev.coreMembers[role].bankDetails, [field]: value }
        }
      }
    }));
  };

  const handleAddBank = () => {
    if (!newBank.accountName || !newBank.accountNumber || !newBank.bankName) {
      return toast.error('Account Name, Bank Name and A/c Number are required');
    }
    if (editingBankIndex !== null) {
      const updated = [...form.bankAccounts];
      updated[editingBankIndex] = newBank;
      setForm(prev => ({ ...prev, bankAccounts: updated }));
      setEditingBankIndex(null);
      toast.success('Bank Account Updated');
    } else {
      setForm(prev => ({ ...prev, bankAccounts: [...prev.bankAccounts, newBank] }));
      toast.success('Bank Account Added');
    }
    setNewBank({ accountName: '', bankName: '', accountNumber: '', ifscCode: '', branch: '' });
  };

  const handleDeleteBank = (idx) => {
    if (!window.confirm('Delete this bank account?')) return;
    const updated = form.bankAccounts.filter((_, i) => i !== idx);
    setForm(prev => ({ ...prev, bankAccounts: updated }));
  };

  const handleEditBank = (idx) => {
    setNewBank(form.bankAccounts[idx]);
    setEditingBankIndex(idx);
  };

  const handleEditMember = (index) => {
    const member = form.bodMembers[index];
    setNewMember({ ...member });
    setEditingIndex(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddNewMember = () => {
    if (!newMember.name) return toast.error('Name is required');
    
    if (editingIndex !== null) {
      const updated = [...form.bodMembers];
      updated[editingIndex] = { ...newMember };
      setForm((prev) => ({ ...prev, bodMembers: updated }));
      setEditingIndex(null);
      toast.success('Member updated');
    } else {
      setForm((prev) => ({
        ...prev,
        bodMembers: [...prev.bodMembers, { ...newMember, status: 'ACTIVE' }],
      }));
      toast.success('Member added');
    }
    
    setNewMember({ 
      designation: 'BOD Manager', name: '', mobile: '', address: '', 
      bankDetails: { bankName: '', accountNumber: '', ifscCode: '', branch: '' } 
    });
  };

  const deleteBodMember = (index) => {
    if (!window.confirm('Delete this member?')) return;
    const updated = form.bodMembers.filter((_, i) => i !== index);
    setForm((prev) => ({ ...prev, bodMembers: updated }));
    if (editingIndex === index) {
      setEditingIndex(null);
      setNewMember({ 
        designation: 'BOD Manager', name: '', mobile: '', address: '', 
        bankDetails: { bankName: '', accountNumber: '', ifscCode: '', branch: '' } 
      });
    }
  };

  const toggleBodStatus = (index) => {
    const updated = [...form.bodMembers];
    updated[index].status = updated[index].status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setForm((prev) => ({ ...prev, bodMembers: updated }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateClfBod(clf._id, form);
      toast.success('Details Updated!');
      onUpdated?.();
      onClose?.();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  if (!clf) return null;

  const renderCoreMember = (role, label) => {
    const m = form.coreMembers[role];
    return (
      <div style={{ background: theme.colors.background, padding: 16, borderRadius: 8, marginBottom: 12, border: `1px solid ${theme.colors.border}` }}>
        <h5 style={{ margin: '0 0 12px', color: theme.colors.primary, fontSize: 14 }}>{label}</h5>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <Input label="Name" value={m.name} onChange={(e) => handleCoreChange(role, 'name', e.target.value)} />
          <Input label="Mobile" value={m.mobile} onChange={(e) => handleCoreChange(role, 'mobile', e.target.value)} />
        </div>
        <div style={{ marginTop: 12 }}>
          <Input label="Address" value={m.address} onChange={(e) => handleCoreChange(role, 'address', e.target.value)} />
        </div>
        
        <div style={{ marginTop: 12, padding: 12, background: theme.colors.surface, borderRadius: 8 }}>
          <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 700, color: theme.colors.muted, textTransform: 'uppercase' }}>Bank Details</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            <Input label="Bank Name" value={m.bankDetails.bankName || ''} onChange={(e) => handleCoreBankChange(role, 'bankName', e.target.value)} />
            <Input label="A/c No." value={m.bankDetails.accountNumber} onChange={(e) => handleCoreBankChange(role, 'accountNumber', e.target.value)} />
            <Input label="IFSC" value={m.bankDetails.ifscCode} onChange={(e) => handleCoreBankChange(role, 'ifscCode', e.target.value)} />
            <Input label="Branch" value={m.bankDetails.branch} onChange={(e) => handleCoreBankChange(role, 'branch', e.target.value)} />
          </div>
        </div>
      </div>
    );
  };

  const groupedBod = DESIGNATIONS.reduce((acc, des) => {
    acc[des] = form.bodMembers.filter(m => m.designation === des);
    return acc;
  }, {});

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20, maxHeight: '75vh', overflowY: 'auto', paddingRight: 10 }}>
      
      {/* 1. LETTERHEAD & FOOTER SECTION */}
      <div>
        <h4 style={{ margin: '0 0 12px', color: theme.colors.primary, borderBottom: `1px solid ${theme.colors.border}`, paddingBottom: 8 }}>
          1. Letterhead & Footer (Advice PDF)
        </h4>
        <div style={{ background: theme.colors.background, padding: 16, borderRadius: 8, marginBottom: 16, border: `1px solid ${theme.colors.border}` }}>
          
          {/* ✅ CLF Name Input (Editable) */}
          <div style={{ marginBottom: 12 }}>
            <Input label="CLF Main Name (Title)" value={form.name} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} required />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Registration No." value={form.letterhead.registrationNo} onChange={(e) => handleLetterheadChange('registrationNo', e.target.value)} />
          </div>
          
          <div style={{ marginTop: 12 }}>
            <Input label="Address Line" value={form.letterhead.addressLine} onChange={(e) => handleLetterheadChange('addressLine', e.target.value)} />
          </div>

          {/* ✅ Logo Upload Section */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16, padding: 12, background: theme.colors.surface, borderRadius: 8, border: `1px dashed ${theme.colors.border}` }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: theme.colors.text, marginBottom: 6 }}>Left Logo</label>
              {form.letterhead.leftLogo && (
                <img src={form.letterhead.leftLogo} alt="Left Logo" style={{ width: 60, height: 60, objectFit: 'contain', borderRadius: 6, border: `1px solid ${theme.colors.border}`, marginBottom: 8, background: '#fff' }} />
              )}
              <input type="file" accept="image/*" onChange={(e) => handleLogoUpload(e, 'leftLogo')} style={{ fontSize: 12 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: theme.colors.text, marginBottom: 6 }}>Right Logo</label>
              {form.letterhead.rightLogo && (
                <img src={form.letterhead.rightLogo} alt="Right Logo" style={{ width: 60, height: 60, objectFit: 'contain', borderRadius: 6, border: `1px solid ${theme.colors.border}`, marginBottom: 8, background: '#fff' }} />
              )}
              <input type="file" accept="image/*" onChange={(e) => handleLogoUpload(e, 'rightLogo')} style={{ fontSize: 12 }} />
            </div>
          </div>
          
          {/* Footer Section */}
          <div style={{ marginTop: 20, borderTop: `1px dashed ${theme.colors.border}`, paddingTop: 16 }}>
            <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 700, color: theme.colors.muted, textTransform: 'uppercase' }}>Footer Text</p>
            <Input label="Block Office" value={form.footer.blockOffice} onChange={(e) => handleFooterChange('blockOffice', e.target.value)} />
            <Input label="District Office" value={form.footer.districtOffice} onChange={(e) => handleFooterChange('districtOffice', e.target.value)} style={{ marginTop: 8 }} />
            <Input label="State Office" value={form.footer.stateOffice} onChange={(e) => handleFooterChange('stateOffice', e.target.value)} style={{ marginTop: 8 }} />
            <Input label="Phone" value={form.footer.phone} onChange={(e) => handleFooterChange('phone', e.target.value)} style={{ marginTop: 8 }} />
          </div>

          {/* Signatures Section */}
          <div style={{ marginTop: 20, borderTop: `1px dashed ${theme.colors.border}`, paddingTop: 16 }}>
            <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 700, color: theme.colors.muted, textTransform: 'uppercase' }}>Signatures</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <Input label="1st (Left)" value={form.signatures.first} onChange={(e) => handleSignatureChange('first', e.target.value)} />
              <Input label="2nd (Center)" value={form.signatures.second} onChange={(e) => handleSignatureChange('second', e.target.value)} />
              <Input label="3rd (Right)" value={form.signatures.third} onChange={(e) => handleSignatureChange('third', e.target.value)} />
            </div>
          </div>

        </div>
      </div>

      {/* 2. CLF Bank Accounts Section */}
      <div>
        <h4 style={{ margin: '0 0 12px', color: theme.colors.primary, borderBottom: `1px solid ${theme.colors.border}`, paddingBottom: 8 }}>
          2. CLF Bank Accounts
        </h4>
        <div style={{ background: theme.colors.background, padding: 16, borderRadius: 8, marginBottom: 16, border: `1px dashed ${theme.colors.primary}50` }}>
          <h5 style={{ margin: '0 0 12px', fontSize: 13, color: theme.colors.primary }}>
            {editingBankIndex !== null ? 'Edit Bank Account' : 'Add New Bank Account'}
          </h5>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            <Input label="Account Name *" value={newBank.accountName} onChange={(e) => setNewBank(p => ({ ...p, accountName: e.target.value }))} placeholder="e.g. Main Account" />
            <Input label="Bank Name *" value={newBank.bankName} onChange={(e) => setNewBank(p => ({ ...p, bankName: e.target.value }))} placeholder="e.g. SBI" />
            <Input label="A/c Number *" value={newBank.accountNumber} onChange={(e) => setNewBank(p => ({ ...p, accountNumber: e.target.value }))} placeholder="e.g. 1234567890" />
            <Input label="IFSC" value={newBank.ifscCode} onChange={(e) => setNewBank(p => ({ ...p, ifscCode: e.target.value }))} placeholder="e.g. SBIN0001234" />
            <Input label="Branch" value={newBank.branch} onChange={(e) => setNewBank(p => ({ ...p, branch: e.target.value }))} placeholder="e.g. Satbarwa" />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <Button type="button" onClick={handleAddBank} style={{ flex: 1 }}>{editingBankIndex !== null ? 'Update Account' : '+ Add Account'}</Button>
            {editingBankIndex !== null && <Button type="button" variant="ghost" onClick={() => { setEditingBankIndex(null); setNewBank({ accountName: '', bankName: '', accountNumber: '', ifscCode: '', branch: '' }); }}>Cancel</Button>}
          </div>
        </div>

        {form.bankAccounts.map((bank, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: theme.colors.surface, borderRadius: 8, marginBottom: 8, border: `1px solid ${theme.colors.border}` }}>
            <div>
              <div style={{ fontWeight: 600, color: theme.colors.text }}>{bank.accountName} - {bank.bankName}</div>
              <div style={{ fontSize: 12, color: theme.colors.muted, fontFamily: 'monospace' }}>A/c: {bank.accountNumber} | IFSC: {bank.ifscCode || '-'} | Branch: {bank.branch || '-'}</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <Button type="button" size="sm" onClick={() => handleEditBank(idx)} style={{ background: theme.colors.info, color: theme.colors.textLight }}>Edit</Button>
              <Button type="button" size="sm" variant="danger" onClick={() => handleDeleteBank(idx)}>Delete</Button>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Core Members Section */}
      <div>
        <h4 style={{ margin: '0 0 12px', color: theme.colors.primary, borderBottom: `1px solid ${theme.colors.border}`, paddingBottom: 8 }}>
          3. Core Members
        </h4>
        {renderCoreMember('president', 'अध्यक्ष (President)')}
        {renderCoreMember('secretary', 'सचिव (Secretary)')}
        {renderCoreMember('treasurer', 'कोषाध्यक्ष (Treasurer)')}
      </div>

      {/* 4. BOD Members Section */}
      <div>
        <h4 style={{ margin: '0 0 12px', color: theme.colors.primary, borderBottom: `1px solid ${theme.colors.border}`, paddingBottom: 8 }}>
          4. Other Members (BOD, Manager, etc.)
        </h4>
        <div style={{ background: theme.colors.background, padding: 16, borderRadius: 8, marginBottom: 20, border: `1px dashed ${theme.colors.primary}50` }}>
          <h5 style={{ margin: '0 0 12px', fontSize: 13, color: theme.colors.primary }}>
            {editingIndex !== null ? 'Edit Member' : 'Add New Member'}
          </h5>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 12 }}>
            <Select label="Designation" value={newMember.designation} onChange={(e) => setNewMember(prev => ({ ...prev, designation: e.target.value }))} options={DESIGNATIONS.map(d => ({ value: d, label: d }))} />
            <Input label="Name" value={newMember.name} onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))} />
            <Input label="Mobile" value={newMember.mobile} onChange={(e) => setNewMember(prev => ({ ...prev, mobile: e.target.value }))} />
          </div>
          
          <div style={{ marginBottom: 12 }}>
            <Input label="Address" value={newMember.address} onChange={(e) => setNewMember(prev => ({ ...prev, address: e.target.value }))} />
          </div>
          
          <div style={{ marginTop: 8, padding: 12, background: theme.colors.surface, borderRadius: 8 }}>
            <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 700, color: theme.colors.muted, textTransform: 'uppercase' }}>Bank Details</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              <Input label="Bank Name" value={newMember.bankDetails.bankName} onChange={(e) => setNewMember(prev => ({ ...prev, bankDetails: { ...prev.bankDetails, bankName: e.target.value } }))} />
              <Input label="A/c No." value={newMember.bankDetails.accountNumber} onChange={(e) => setNewMember(prev => ({ ...prev, bankDetails: { ...prev.bankDetails, accountNumber: e.target.value } }))} />
              <Input label="IFSC" value={newMember.bankDetails.ifscCode} onChange={(e) => setNewMember(prev => ({ ...prev, bankDetails: { ...prev.bankDetails, ifscCode: e.target.value } }))} />
              <Input label="Branch" value={newMember.bankDetails.branch} onChange={(e) => setNewMember(prev => ({ ...prev, bankDetails: { ...prev.bankDetails, branch: e.target.value } }))} />
            </div>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
            <Button type="button" onClick={handleAddNewMember} style={{ flex: 1, minWidth: 150 }}>
              {editingIndex !== null ? 'Update Member' : '+ Add to List'}
            </Button>
            {editingIndex !== null && (
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => {
                  setEditingIndex(null);
                  setNewMember({ designation: 'BOD Manager', name: '', mobile: '', address: '', bankDetails: { bankName: '', accountNumber: '', ifscCode: '', branch: '' } });
                }}
                style={{ flex: 1, minWidth: 100 }}
              >
                Cancel Edit
              </Button>
            )}
          </div>
        </div>

        {DESIGNATIONS.map(des => {
          const members = groupedBod[des];
          if (members.length === 0) return null;
          
          return (
            <div key={des} style={{ marginBottom: 16 }}>
              <h5 style={{ margin: '0 0 8px', fontSize: 13, color: theme.colors.text, textTransform: 'uppercase', letterSpacing: 0.5 }}>{des} List</h5>
              {members.map((member, idx) => {
                const globalIndex = form.bodMembers.findIndex(m => m === member);
                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '12px', background: theme.colors.background, borderRadius: 8, marginBottom: 8, border: `1px solid ${theme.colors.border}` }}>
                    <div>
                      <div style={{ fontWeight: 600, color: theme.colors.text, fontSize: 14 }}>{member.name}</div>
                      <div style={{ fontSize: 12, color: theme.colors.muted }}>{member.mobile} • {member.address}</div>
                      
                      {member.bankDetails?.bankName && (
                        <div style={{ fontSize: 11, color: theme.colors.primary, marginTop: 4, fontWeight: 500 }}>
                          Bank: {member.bankDetails.bankName} (A/c: {member.bankDetails.accountNumber})
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      <Button type="button" size="sm" onClick={() => handleEditMember(globalIndex)} style={{ background: theme.colors.info, color: theme.colors.textLight, flex: 1 }}>Edit</Button>
                      <Button type="button" size="sm" onClick={() => toggleBodStatus(globalIndex)} style={{ background: member.status === 'ACTIVE' ? theme.colors.success : theme.colors.muted, color: theme.colors.textLight, flex: 1 }}>
                        {member.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button type="button" size="sm" variant="danger" onClick={() => deleteBodMember(globalIndex)} style={{ flex: 1 }}>Delete</Button>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 10, borderTop: `1px solid ${theme.colors.border}`, paddingTop: 16 }}>
        <Button type="button" variant="ghost" onClick={onClose} style={{ flex: 1, minWidth: 100 }}>Cancel</Button>
        <Button type="submit" loading={loading} style={{ flex: 1, minWidth: 150 }}>Save All Details</Button>
      </div>
    </form>
  );
}