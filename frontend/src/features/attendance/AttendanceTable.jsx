import Table from '../../components/ui/Table.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { theme } from '../../config/theme.js'; //  Theme import kiya

export default function AttendanceTable({ attendance = [], loading = false }) {
  const columns = [
    { header: 'Date', key: 'date' },
    { 
      header: 'Employee', 
      render: (r) => (
        <span style={{ fontWeight: 600, color: theme.colors.text }}>
          {r.employeeId?.name || '—'}
        </span>
      ) 
    },
    { 
      header: 'Code', 
      render: (r) => (
        <span style={{ color: theme.colors.muted }}>
          {r.employeeId?.employeeCode || '—'}
        </span>
      ) 
    },
    {
      header: 'Status',
      render: (r) => {
        //  Status ke hisaab se Badge ka variant set karo
        let variant = 'warning'; // Default
        if (r.status === 'PRESENT') variant = 'success';
        else if (r.status === 'ABSENT') variant = 'danger';
        else if (r.status === 'LEAVE') variant = 'info'; //  LEAVE ke liye Blue (info) badge

        return (
          <Badge variant={variant}>
            {r.status}
          </Badge>
        );
      },
    },
    { 
      header: 'Source', 
      key: 'source',
      render: (r) => (
        <span style={{ textTransform: 'capitalize', color: theme.colors.muted }}>
          {r.source || 'Manual'}
        </span>
      )
    },
  ];
  
  return <Table columns={columns} data={attendance} loading={loading} />;
}