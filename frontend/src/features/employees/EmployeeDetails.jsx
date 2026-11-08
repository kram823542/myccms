import { theme } from '../../config/theme.js';
import Badge from '../../components/ui/Badge.jsx';

export default function EmployeeDetails({ employee }) {
  if (!employee) return null;

  const section = (title, rows) => (
    <div
      style={{
        background: theme.colors.surface,
        borderRadius: theme.radius.md,
        padding: 20,
        marginBottom: 16,
        boxShadow: theme.shadow.sm,
      }}
    >
      <h3 style={{ margin: '0 0 12px', fontSize: 15, color: theme.colors.text }}>{title}</h3>
      {rows.map(([k, v]) => (
        <div
          key={k}
          style={{
            display: 'grid',
            gridTemplateColumns: '160px 1fr',
            padding: '8px 0',
            borderBottom: `1px solid ${theme.colors.border}`,
            fontSize: 14,
          }}
        >
          <span style={{ color: theme.colors.muted, fontWeight: 600 }}>{k}</span>
          <span style={{ color: theme.colors.text }}>{v || '—'}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div>
      {section('Personal Info', [
        ['Employee Code', employee.employeeCode],
        ['Name', employee.name],
        ['Mobile', employee.mobile],
        ['Designation', employee.designation],
        ['Joining Date', employee.joiningDate?.slice(0, 10)],
        ['Aadhaar', employee.aadhaarNumber],
        ['Status', <Badge key="status" variant={employee.status === 'ACTIVE' ? 'success' : 'danger'}>{employee.status}</Badge>],
      ])}

      {section('Bank Details', [
        ['Bank Name', employee.bankDetails?.bankName],
        ['Account No', employee.bankDetails?.accountNumber],
        ['Branch', employee.bankDetails?.branch],
        ['IFSC', employee.bankDetails?.ifsc],
      ])}

      {section('Work Location', [
        ['Panchayat', employee.workLocation?.panchayat],
        ['CLF', employee.clfId?.name],
      ])}
    </div>
  );
}