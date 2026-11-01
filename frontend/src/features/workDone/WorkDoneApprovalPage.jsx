import { useEffect, useState, Fragment } from 'react'; // ✅ Fragment import kiya
import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader.jsx';
import Table from '../../components/ui/Table.jsx';
import Badge from '../../components/ui/Badge.jsx';
import WorkDoneForm from './WorkDoneForm.jsx';
import { theme } from '../../config/theme.js';
import { getAuthUser } from '../../utils/authStorage.js';
import * as api from './workDone.api.js';

export default function WorkDonePage() {
  const user = getAuthUser() || {};
  const isEmployee = user.role === 'EMPLOYEE';

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(!isEmployee);
  const [showForm, setShowForm] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);

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

  if (isEmployee) {
    const columns = [
      { header: 'Date', key: 'date' },
      { header: 'Description', render: (r) => <div style={{ maxWidth: 400 }}>{r.description}</div> },
      { header: 'Status', render: (r) => <Badge variant={r.status === 'APPROVED' ? 'success' : r.status === 'REJECTED' ? 'danger' : 'warning'}>{r.status}</Badge> },
      {
        header: 'Reason / Action',
        render: (r) => {
          if (r.status !== 'REJECTED') return <span style={{ color: theme.colors.muted }}>—</span>;
          return (
            <button onClick={() => setExpandedRow(expandedRow === r._id ? null : r._id)} style={{ background: 'transparent', border: 'none', color: theme.colors.danger, fontWeight: 600, cursor: 'pointer', fontSize: 13, padding: 0 }}>
              {expandedRow === r._id ? '▼ Hide Reason' : '▶ View Reason'}
            </button>
          );
        },
      },
    ];

    return (
      <>
        <PageHeader title="Work Done" subtitle="Window: 5:00 PM – 10:00 PM IST" />
        {showForm ? (
          <WorkDoneForm onSubmitted={() => { setShowForm(false); load(); }} onCancel={() => setShowForm(false)} />
        ) : (
          <>
            <button onClick={() => setShowForm(true)} style={{ padding: '12px 20px', background: theme.colors.primary, color: theme.colors.textLight, border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer', marginBottom: 20 }}>
              + Submit Work Done
            </button>

            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: theme.colors.muted }}>Loading...</div>
            ) : items.length === 0 ? (
              <div style={{ padding: 40, background: theme.colors.surface, borderRadius: theme.radius.md, textAlign: 'center', color: theme.colors.muted }}>No work done submissions yet.</div>
            ) : (
              <div style={{ background: theme.colors.surface, borderRadius: theme.radius.md, boxShadow: theme.shadow.sm, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: theme.colors.background }}>
                      <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600 }}>Date</th>
                      <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600 }}>Description</th>
                      <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600 }}>Status</th>
                      <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600 }}>Reason / Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      /* ✅ FIXED: React Fragment with key */
                      <Fragment key={item._id}>
                        <tr style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
                          <td style={{ padding: '12px 14px', fontWeight: 500 }}>{item.date}</td>
                          <td style={{ padding: '12px 14px' }}><div style={{ maxWidth: 400 }}>{item.description}</div></td>
                          <td style={{ padding: '12px 14px' }}><Badge variant={item.status === 'APPROVED' ? 'success' : item.status === 'REJECTED' ? 'danger' : 'warning'}>{item.status}</Badge></td>
                          <td style={{ padding: '12px 14px' }}>
                            {item.status === 'REJECTED' ? (
                              <button onClick={() => setExpandedRow(expandedRow === item._id ? null : item._id)} style={{ background: 'transparent', border: 'none', color: theme.colors.danger, fontWeight: 600, cursor: 'pointer', fontSize: 13, padding: 0 }}>
                                {expandedRow === item._id ? '▼ Hide Reason' : '▶ View Reason'}
                              </button>
                            ) : (<span style={{ color: theme.colors.muted }}>—</span>)}
                          </td>
                        </tr>

                        {expandedRow === item._id && item.status === 'REJECTED' && (
                          <tr>
                            <td colSpan={4} style={{ padding: '12px 14px', background: `${theme.colors.danger}10`, borderBottom: `1px solid ${theme.colors.border}`, borderLeft: `3px solid ${theme.colors.danger}` }}>
                              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                <div style={{ fontSize: 18, color: theme.colors.danger, lineHeight: 1 }}>⚠️</div>
                                <div>
                                  <div style={{ fontSize: 12, fontWeight: 700, color: theme.colors.danger, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>Rejection Reason</div>
                                  <div style={{ fontSize: 13, color: theme.colors.text }}>{item.rejectionReason || 'No reason provided'}</div>
                                  {item.rejectedAt && <div style={{ fontSize: 11, color: theme.colors.muted, marginTop: 4 }}>Rejected on: {new Date(item.rejectedAt).toLocaleString()}</div>}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </>
    );
  }

  const columns = [
    { header: 'Employee', render: (r) => r.employeeId?.name || '—' },
    { header: 'Code', render: (r) => r.employeeId?.employeeCode || '—' },
    { header: 'Date', key: 'date' },
    { header: 'Description', render: (r) => <div style={{ maxWidth: 300 }}>{r.description}</div> },
    { header: 'Status', render: (r) => <Badge variant={r.status === 'APPROVED' ? 'success' : r.status === 'REJECTED' ? 'danger' : 'warning'}>{r.status}</Badge> },
    { header: 'Rejection Reason', render: (r) => r.status === 'REJECTED' ? (<div style={{ maxWidth: 260, fontSize: 12, color: theme.colors.danger, padding: '4px 8px', background: `${theme.colors.danger}10`, borderRadius: 6, borderLeft: `2px solid ${theme.colors.danger}` }}>{r.rejectionReason || 'No reason'}</div>) : (<span style={{ color: theme.colors.muted }}>—</span>) },
  ];

  return (
    <>
      <PageHeader title="Work Done" actions={user.role === 'CLF' && (<Link to="/clf/work-done/approval" style={{ textDecoration: 'none' }}><span style={{ padding: '10px 16px', background: theme.colors.primary, color: theme.colors.textLight, borderRadius: 10, fontWeight: 600 }}>Pending Approvals</span></Link>)} />
      <Table columns={columns} data={items} loading={loading} />
    </>
  );
}