import { Outlet } from 'react-router-dom';
import Sidebar from '../components/navigation/Sidebar.jsx';
import BottomBar from '../components/navigation/BottomBar.jsx';
import Breadcrumb from '../components/navigation/Breadcrumb.jsx';
import NotificationPopup from '../features/notifications/NotificationPopup.jsx';
import { theme } from '../config/theme.js';

const menu = [
  { label: 'Dashboard', path: '/clf' },
  { label: 'Employees', path: '/clf/employees' },
  { label: 'Work', path: '/clf/work' },
  { label: 'Advice', path: '/clf/advice' },
  { label: 'Top Sheet', path: '/clf/topsheet' },
    { label: 'Resources', path: '/clf/resources' },   //  NEW
  { label: 'Attendance', path: '/clf/attendance' },
  { label: 'Leaves', path: '/clf/leaves' },
  { label: 'Notifications', path: '/clf/notifications' },
  { label: 'Reports', path: '/clf/reports' },
  { label: 'Profile', path: '/clf/profile' },
];

export default function ClfLayout() {
  return (
    <div style={{ minHeight: '100vh', background: theme.colors.background }}>
      <Sidebar title="CLF Admin" menu={menu} />

      <div className="clf-content" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', paddingBottom: 70 }}>
        <Breadcrumb />
        <main style={{ padding: 'clamp(16px, 2vw, 24px)', flex: 1 }}>
          <Outlet />
        </main>
      </div>

      <BottomBar menu={menu} />
      <NotificationPopup />
    </div>
  );
}