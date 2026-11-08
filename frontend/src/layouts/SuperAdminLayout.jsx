import { Outlet } from 'react-router-dom';
import Sidebar from '../components/navigation/Sidebar.jsx';
import BottomBar from '../components/navigation/BottomBar.jsx';
import Breadcrumb from '../components/navigation/Breadcrumb.jsx';
import { theme } from '../config/theme.js';

const menu = [
  { label: 'Dashboard', path: '/super-admin' },
  { label: 'Users', path: '/super-admin/users' },
  { label: 'Blocks', path: '/super-admin/blocks' },
  { label: 'Audit Logs', path: '/super-admin/audit-logs' },
  { label: 'Reports', path: '/super-admin/reports' },
  { label: 'System Control', path: '/super-admin/system' },
  { label: 'Profile', path: '/super-admin/profile' },   //  ADDED
];

export default function SuperAdminLayout() {
  return (
    <div style={{ minHeight: '100vh', background: theme.colors.background }}>
      <Sidebar title="Super Admin" menu={menu} />

      <div
        className="clf-content"
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          paddingBottom: 70,
        }}
      >
        <Breadcrumb />
        <main style={{ padding: 24, flex: 1 }}>
          <Outlet />
        </main>
      </div>

      <BottomBar menu={menu} />
    </div>
  );
}