import Table from '../../components/ui/Table.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { theme } from '../../config/theme.js';

export default function EmployeeTable({ employees = [], loading = false }) {
  
  // Custom columns define kar rahe hain
  const columns = [
    {
      header: 'Employee',
      key: 'name',
      render: (r) => {
        const dp = r.profilePhoto || r.userId?.profilePhoto; //  DP fetch
        const initial = (r.name || '?').charAt(0).toUpperCase();

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/*  Avatar Circle */}
            <div 
              style={{ 
                width: 38, 
                height: 38, 
                borderRadius: '50%', 
                background: `${theme.colors.primary}15`, 
                border: `1px solid ${theme.colors.primary}30`,
                color: theme.colors.primary,
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: 16, 
                fontWeight: 'bold', 
                overflow: 'hidden', 
                flexShrink: 0
              }}
            >
              {dp ? (
                <img 
                  src={dp} 
                  alt={r.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              ) : (
                initial
              )}
            </div>
            
            {/* Name & Code */}
            <div>
              <div style={{ fontWeight: 600, color: theme.colors.text }}>{r.name}</div>
              <div style={{ fontSize: 12, color: theme.colors.muted }}>{r.employeeCode}</div>
            </div>
          </div>
        );
      }
    },
    { header: 'Designation', key: 'designation' },
    { header: 'Mobile', key: 'mobile' },
    {
      header: 'Status',
      render: (r) => (
        <Badge variant={r.status === 'ACTIVE' ? 'success' : 'danger'}>{r.status}</Badge>
      ),
    },
  ];

  return <Table columns={columns} data={employees} loading={loading} />;
}