import { useEffect, useState, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { theme } from '../../config/theme.js';
import { getAuthUser } from '../../utils/authStorage.js';
import { renderDynamicIcon } from './Sidebar.jsx';

export default function BottomBar({ menu = [] }) {
  const location = useLocation();
  const [sliderStyle, setSliderStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const itemRefs = useRef([]);
  const user = getAuthUser() || {};

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

  useEffect(() => {
    if (isProfileActive || activeIndex === -1) {
      setSliderStyle((prev) => ({ ...prev, opacity: 0 }));
      return;
    }

    const updateSlider = () => {
      const activeEl = itemRefs.current[activeIndex];
      if (activeEl) {
        setSliderStyle({
          left: activeEl.offsetLeft,
          width: activeEl.offsetWidth,
          opacity: 1,
        });
      }
    };

    setTimeout(updateSlider, 50);
    window.addEventListener('resize', updateSlider);
    return () => window.removeEventListener('resize', updateSlider);
  }, [activeIndex, isProfileActive]);

  const userInitial = (user.name || user.username || '?').charAt(0).toUpperCase();

  return (
    <>
      <style>{`
        .custom-bb-container {
          position: fixed;
          bottom: 16px;
          left: 50%;
          transform: translateX(-50%);
          width: calc(100% - 24px);
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
          background: ${theme.colors.bbDarkBrown};
          border-radius: ${theme.radius.full || '9999px'};
          padding: 4px 6px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: ${theme.shadow.lg};
          height: 56px;
          box-sizing: border-box;
          min-width: 0;
          border: 1px solid ${theme.colors.bbIndigo}40;
          position: relative;
        }
        .custom-bb-slider {
          position: absolute;
          top: 4px;
          bottom: 4px;
          background: ${theme.colors.surface};
          border-radius: ${theme.radius.full || '9999px'};
          box-shadow: ${theme.shadow.sm};
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1;
          pointer-events: none;
        }
        .custom-bb-item {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-decoration: none;
          border-radius: ${theme.radius.full || '9999px'};
          transition: color 0.3s ease;
          color: ${theme.colors.bbLightLilac};
          padding: 0 10px;
          min-width: 0;
          white-space: nowrap;
        }
        .custom-bb-item.active { color: ${theme.colors.bbDarkBrown}; padding: 0 14px; }
        .custom-bb-icon { display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .custom-bb-label { font-size: 13px; font-weight: 700; margin-left: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .custom-bb-circle-btn {
          width: 56px;
          height: 56px;
          background: ${theme.colors.bbDarkBrown};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${theme.colors.bbLightLilac};
          text-decoration: none;
          box-shadow: ${theme.shadow.lg};
          flex-shrink: 0;
          transition: all 0.3s ease;
          border: 2px solid transparent;
          overflow: hidden;
          position: relative;
        }
        .custom-bb-circle-btn.active { border-color: ${theme.colors.surface}; box-shadow: 0 0 0 2px ${theme.colors.bbIndigo}; }
        .custom-bb-profile-img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
        .custom-bb-initial { font-size: 20px; font-weight: 800; color: ${theme.colors.bbLightLilac}; }
        @media (max-width: 380px) {
          .custom-bb-container { width: calc(100% - 16px); bottom: 12px; gap: 6px; }
          .custom-bb-main { height: 52px; padding: 3px 4px; }
          .custom-bb-circle-btn { width: 52px; height: 52px; }
          .custom-bb-label { font-size: 12px; margin-left: 4px; }
          .custom-bb-item { padding: 0 8px; }
          .custom-bb-item.active { padding: 0 10px; }
        }
        @media (min-width: 768px) { .custom-bb-container { display: none !important; } }
      `}</style>

      <nav className="custom-bb-container" aria-label="Mobile navigation">
        <div className="custom-bb-main">
          <div className="custom-bb-slider" style={{ left: `${sliderStyle.left}px`, width: `${sliderStyle.width}px`, opacity: sliderStyle.opacity }} />
          {items.map((item, index) => {
            const isActive = activeIndex === index;
            return (
              <Link
                key={item.path}
                to={item.path}
                ref={(el) => { itemRefs.current[index] = el; }}
                className={`custom-bb-item ${isActive ? 'active' : ''}`}
                style={{ width: isActive ? 'auto' : '25%', paddingLeft: isActive ? '14px' : '10px', paddingRight: isActive ? '14px' : '10px' }}
              >
                <span className="custom-bb-icon">{renderDynamicIcon(item, 18)}</span>
                {isActive && <span className="custom-bb-label">{item.label}</span>}
              </Link>
            );
          })}
        </div>

        <Link to={profilePath} className={`custom-bb-circle-btn ${isProfileActive ? 'active' : ''}`} title="Profile">
          {user.profileImage ? <img src={user.profileImage} alt="profile" className="custom-bb-profile-img" /> : <span className="custom-bb-initial">{userInitial}</span>}
        </Link>
      </nav>
    </>
  );
}
