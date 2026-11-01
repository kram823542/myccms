import Table from '../../components/ui/Table.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { theme } from '../../config/theme.js';

function ReasonCell({ item }) {
  if (item.status !== 'REJECTED') {
    return <span style={{ color: theme.colors.muted }}>—</span>;
  }
  return (
    <div
      style={{
        maxWidth: 260,
        fontSize: 12,
        color: theme.colors.danger,
        padding: '6px 10px',
        background: theme.colors.dangerSurface,
        borderRadius: 6,
        borderLeft: `3px solid ${theme.colors.danger}`,
        lineHeight: 1.4,
        whiteSpace: 'pre-wrap',
      }}
      title={item.rejectionReason || 'No reason'}
    >
      {item.rejectionReason || 'No reason provided'}
    </div>
  );
}

export default function WorkDoneTable({ items = [], loading = false }) {
  const columns = [
    { header: 'Employee', render: (r) => r.employeeId?.name || '—' },
    { header: 'Code', render: (r) => r.employeeId?.employeeCode || '—' },
    { header: 'Date', key: 'date' },
    {
      header: 'Description',
      render: (r) => <div style={{ maxWidth: 300 }}>{r.description}</div>,
    },
    {
      header: 'Status',
      render: (r) => (
        <Badge
          variant={
            r.status === 'APPROVED' ? 'success' : r.status === 'REJECTED' ? 'danger' : 'warning'
          }
        >
          {r.status}
        </Badge>
      ),
    },
    {
      header: 'Rejection Reason',
      render: (r) => <ReasonCell item={r} />,
    },
  ];
  return <Table columns={columns} data={items} loading={loading} />;
}