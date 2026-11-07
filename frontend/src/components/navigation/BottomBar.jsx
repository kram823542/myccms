import { useLocation, Link } from 'react-router-dom';
import { theme } from '../../config/theme.js';
import { getAuthUser } from '../../utils/authStorage.js';
import { renderDynamicIcon } from './Sidebar.jsx';

export default function BottomBar({ menu = [] }) {
  const location = useLocation();
  const user = getAuthUser() || {};
  const profileImage = user.profilePhoto || user.profileImage || null;

  const ROLE_MENUS = {
    EMPLOYEE: [
      { label: 'Dashboard', path: '/employee' },
      { label: 'Work', path: '/employee/work' },
      { label: 'Leaves', path: '/employee/leaves' },
      { label: 'Attendance', path: '/employee/attendance' },
    ],
    CLF: [
      { label: 'Dashboard', path: '/clf' },
      { label: 'Employees', path: '/clf/employees' },
      { label: 'Leaves', path: '/clf/leaves' },
      { label: 'Attendance', path: '/clf/attendance' },
    ],
    BPM: [
      { label: 'Dashboard', path: '/bpm' },
      { label: 'CLFs', path: '/bpm/clfs' },
      { label: 'Work', path: '/bpm/work' },
      { label: 'Attendance', path: '/bpm/attendance' },
    ],
  };

  const isEmployee = user.role === 'EMPLOYEE';
  const items = isEmployee ? ROLE_MENUS.EMPLOYEE : (ROLE_MENUS[user.role] ? ROLE_MENUS[user.role] : menu.slice(0, 4));

  let currentPath = location.pathname;
  if (currentPath.endsWith('/') && currentPath.length > 1) currentPath = currentPath.slice(0, -1);

  const profilePath = isEmployee ? '/employee/profile' : user.role === 'CLF' ? '/clf/profile' : '/bpm/profile';
  const isProfileActive = currentPath === profilePath || currentPath.startsWith(profilePath + '/');

  let activeIndex = -1;
  let longestMatch = 0;

  if (!isProfileActive) {
    items.forEach((item, index) => {
      let itemPath = item.path || '';
      if (itemPath.endsWith('/') && itemPath.length > 1) itemPath = itemPath.slice(0, -1);
      const isExact = currentPath === itemPath;
      const isPrefix = currentPath.startsWith(itemPath + '/');
      if ((isExact || isPrefix) && itemPath.length > longestMatch) {
        activeIndex = index;
        longestMatch = itemPath.length;
      }
    });
  }

  const userInitial = (user.name || user.username || '?').charAt(0).toUpperCase();

  return (
    <>
      <style>{`
        .custom-bb-container {
          position: fixed;
          bottom: 12px;
          left: 50%;
          transform: translateX(-50%);
          width: calc(100% - 16px);
          max-width: 440px;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          pointer-events: none;
          box-sizing: border-box;
        }
        .custom-bb-container * { pointer-events: auto; }
        .custom-bb-main {
          flex: 1;
          background: ${theme.colors.secondary};
          border-radius: 9999px;
          padding: 4px 6px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2px;
          box-shadow: ${theme.shadow.lg};
          height: 54px;
          box-sizing: border-box;
          min-width: 0;
          border: 1px solid ${theme.colors.primary}40;
          overflow: hidden;
        }
        .custom-bb-item {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-decoration: none;
          border-radius: 9999px;
          transition: all 0.2s ease;
          color: ${theme.colors.background};
          padding: 0 4px;
          flex: 1 1 0;
          min-width: 26px;
          white-space: nowrap;
          overflow: hidden;
        }
        .custom-bb-item.active {
          flex: 0 1 auto;
          max-width: calc(100% - 50px);
          color: ${theme.colors.primary};
          background: ${theme.colors.surface};
          box-shadow: ${theme.shadow.sm};
          padding: 0 10px;
        }
        .custom-bb-icon { display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .custom-bb-label { display: block; font-size: clamp(10px, 2.8vw, 12px); font-weight: 700; margin-left: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .custom-bb-circle-btn {
          width: 54px;
          height: 54px;
          background: ${theme.colors.secondary};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${theme.colors.background};
          text-decoration: none;
          box-shadow: ${theme.shadow.lg};
          flex-shrink: 0;
          transition: all 0.3s ease;
          border: 2px solid ${theme.colors.primary}50;
          overflow: hidden;
          position: relative;
        }
        .custom-bb-circle-btn.active { 
          border-color: ${theme.colors.surface}; 
          background: ${theme.colors.primary};
          box-shadow: 0 0 0 3px ${theme.colors.accent}60; 
        }
        .custom-bb-profile-img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
        .custom-bb-initial { font-size: 18px; font-weight: 800; color: ${theme.colors.textLight}; }
        
        @media (max-width: 320px) {
          .custom-bb-container { bottom: 8px; gap: 4px; width: calc(100% - 10px); }
          .custom-bb-main { height: 48px; padding: 3px 4px; }
          .custom-bb-circle-btn { width: 48px; height: 48px; }
          .custom-bb-item.active { max-width: calc(100% - 40px); padding: 0 6px; }
        }
        @media (min-width: 768px) { .custom-bb-container { display: none !important; } }
      `}</style>

      <nav className="custom-bb-container" aria-label="Mobile navigation">
        <div className="custom-bb-main">
          {items.map((item, index) => {
            const isActive = activeIndex === index;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`custom-bb-item ${isActive ? 'active' : ''}`}
              >
                <span className="custom-bb-icon">{renderDynamicIcon(item, 16)}</span>
                {isActive && <span className="custom-bb-label">{item.label}</span>}
              </Link>
            );
          })}
        </div>

        <Link to={profilePath} className={`custom-bb-circle-btn ${isProfileActive ? 'active' : ''}`} title="Profile">
          {profileImage ? <img src={profileImage} alt="profile" className="custom-bb-profile-img" /> : <span className="custom-bb-initial">{userInitial}</span>}
        </Link>
      </nav>
    </>
  );
}
