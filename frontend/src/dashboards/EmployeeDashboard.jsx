import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader.jsx';
import Badge from '../components/ui/Badge.jsx';
import { getAuthUser, setAuthUser } from '../utils/authStorage.js'; // ✅ setAuthUser import kiya
import { theme } from '../config/theme.js';
import * as actionApi from '../features/actionPlans/actionPlans.api.js';
import * as workApi from '../features/workDone/workDone.api.js';
import * as attendanceApi from '../features/attendance/attendance.api.js';
import * as notificationApi from '../features/notifications/notifications.api.js';
import { getEmployee } from '../features/employees/employees.api.js'; 

// ... (getGreeting, getCurrentWindow, getTodayStr, getMonthRange same rahenge)
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const getCurrentWindow = () => {
  const now = new Date();
  const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const hour = istTime.getHours();
  if (hour >= 8 && hour < 11) return 'ACTION_PLAN_OPEN';
  if (hour >= 17 && hour < 22) return 'WORK_DONE_OPEN';
  return 'CLOSED';
};

const getTodayStr = () => {
  const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  return d.toISOString().slice(0, 10);
};

const getMonthRange = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  const start = `${y}-${String(m).padStart(2, '0')}-01`;
  const lastDay = new Date(y, m, 0).getDate();
  const end = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  return { start, end };
};

export default function EmployeeDashboard() {
  const user = getAuthUser() || {};
  const greeting = getGreeting();
  const currentWindow = getCurrentWindow();

  const [loading, setLoading] = useState(true);
  const [todayPlan, setTodayPlan] = useState(null);
  const [todayWork, setTodayWork] = useState(null);
  const [monthAttendance, setMonthAttendance] = useState({ present: 0, absent: 0, total: 0 });
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentWork, setRecentWork] = useState([]);
  const [employeeData, setEmployeeData] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const today = getTodayStr();
      const { start, end } = getMonthRange();

      await Promise.all([
        getEmployee(user.employeeId)
          .then(({ data }) => {
            setEmployeeData(data.data);
            // ✅ FIX: SessionStorage me Employee ka sahi naam update kar diya
            const stored = getAuthUser() || {};
            setAuthUser({ ...stored, name: data.data.name });
          })
          .catch(() => {}),

        actionApi
          .todayActionPlan()
          .then(({ data }) => setTodayPlan(data.data || null))
          .catch(() => setTodayPlan(null)),

        workApi
          .listWorkDone({})
          .then(({ data }) => {
            const items = data.data.workDone || [];
            setRecentWork(items.slice(0, 5));
            const todays = items.find((w) => w.date === today);
            setTodayWork(todays || null);
          })
          .catch(() => {}),

        attendanceApi
          .listAttendance({ from: start, to: end })
          .then(({ data }) => {
            const att = data.data.attendance || [];
            const present = att.filter((a) => a.status === 'PRESENT').length;
            const absent = att.filter((a) => a.status === 'ABSENT').length;
            setMonthAttendance({ present, absent, total: att.length });
          })
          .catch(() => {}),

        notificationApi
          .unreadCount()
          .then(({ data }) => setUnreadCount(data.data?.count || 0))
          .catch(() => {}),
      ]);

      setLoading(false);
    };
    load();
  }, [user.employeeId]);

  // ... (Baaki Card, planBadge, workBadge, displayName same rahenge)
  const displayName = employeeData?.name || user.name || 'Employee';

  const Card = ({ to, title, subtitle, color, badge, badgeVariant }) => (
    // ... (same as before)
    <Link to={to} style={{ textDecoration: 'none', background: theme.colors.surface, borderRadius: theme.radius.md, padding: 18, boxShadow: theme.shadow.sm, border: `1px solid ${theme.colors.border}`, borderLeft: `4px solid ${color}`, color: theme.colors.text, display: 'block', transition: 'transform 0.15s ease, box-shadow 0.15s ease', position: 'relative' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = theme.shadow.md; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = theme.shadow.sm; }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>{title}</div>
        {badge && (<Badge variant={badgeVariant || 'default'}>{badge}</Badge>)}
      </div>
      <div style={{ fontSize: 12, color: theme.colors.muted, marginTop: 6, lineHeight: 1.4 }}>
        {subtitle}
      </div>
    </Link>
  );

  const planBadge = todayPlan ? { text: 'Submitted', variant: 'success' } : currentWindow === 'ACTION_PLAN_OPEN' ? { text: 'Submit Now', variant: 'warning' } : { text: 'Not Submitted', variant: 'default' };
  const workBadge = todayWork ? { text: todayWork.status, variant: todayWork.status === 'APPROVED' ? 'success' : todayWork.status === 'REJECTED' ? 'danger' : 'warning' } : currentWindow === 'WORK_DONE_OPEN' ? { text: 'Submit Now', variant: 'warning' } : { text: 'Not Submitted', variant: 'default' };

  return (
    <>
      <PageHeader title={`${greeting}, ${displayName} 👋`} subtitle="What would you like to do today?" />
      {/* ... (Baaki UI same rahega jo aapne bheja tha, bas time 8 AM - 11 AM kar diya hai) */}
      {currentWindow !== 'CLOSED' && (
        <div style={{ background: `linear-gradient(90deg, ${theme.colors.primary}15, ${theme.colors.secondary}10)`, border: `1px solid ${theme.colors.primary}40`, borderRadius: theme.radius.md, padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 600, color: theme.colors.primary }}>
          <span style={{ fontSize: 16 }}>⏰</span>
          <span>
            {currentWindow === 'ACTION_PLAN_OPEN' && "Action Plan window is open — submit before 11:00 AM"}
            {currentWindow === 'WORK_DONE_OPEN' && "Work Done window is open — submit before 10:00 PM"}
          </span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 20 }}>
        <MiniStat icon="📝" label="Today's Plan" value={todayPlan ? 'Done' : 'Pending'} color={todayPlan ? theme.colors.success : theme.colors.warning} />
        <MiniStat icon="✅" label="Today's Work" value={todayWork ? todayWork.status === 'APPROVED' ? 'Approved' : todayWork.status === 'REJECTED' ? 'Rejected' : 'Pending' : 'Not Done'} color={todayWork?.status === 'APPROVED' ? theme.colors.success : todayWork?.status === 'REJECTED' ? theme.colors.danger : theme.colors.warning} />
        <MiniStat icon="📅" label="This Month" value={`${monthAttendance.present}P / ${monthAttendance.absent}A`} color={theme.colors.info} />
        <MiniStat icon="🔔" label="Notifications" value={unreadCount > 0 ? `${unreadCount} New` : 'All Read'} color={unreadCount > 0 ? theme.colors.danger : theme.colors.success} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        <Card to="/employee/work" title="📝 Today's Action Plan" subtitle={todayPlan ? `✅ Submitted at ${new Date(todayPlan.submittedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` : 'Submit between 8:00 AM – 11:00 AM'} color={theme.colors.primary} badge={planBadge.text} badgeVariant={planBadge.variant} />
        <Card to="/employee/work" title="✅ Today's Work Done" subtitle={todayWork ? todayWork.status === 'REJECTED' ? `❌ Rejected — ${(todayWork.rejectionReason || '').slice(0, 50)}` : `${todayWork.status === 'APPROVED' ? '✅ Approved' : '⏳ Pending approval'}` : 'Submit between 5:00 PM – 10:00 PM'} color={theme.colors.success} badge={workBadge.text} badgeVariant={workBadge.variant} />
        <Card to="/employee/attendance" title="📅 My Attendance" subtitle={`${monthAttendance.present} Present, ${monthAttendance.absent} Absent this month`} color={theme.colors.info} />
        <Card to="/employee/notifications" title="🔔 Notifications" subtitle={unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'All caught up!'} color={theme.colors.accent} badge={unreadCount > 0 ? `${unreadCount}` : null} badgeVariant="danger" />
        <Card to="/employee/reports" title="📄 My Reports" subtitle="Download monthly Action Plan & Work Done PDFs" color={theme.colors.warning} />
      </div>

      {recentWork.length > 0 && (
        <div style={{ background: theme.colors.surface, borderRadius: theme.radius.md, boxShadow: theme.shadow.sm, border: `1px solid ${theme.colors.border}`, marginTop: 24, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: theme.colors.text, letterSpacing: 0.3 }}>🕒 Recent Work Submissions</h3>
            <Link to="/employee/work" style={{ fontSize: 11, fontWeight: 700, color: theme.colors.primary, textDecoration: 'none' }}>View All →</Link>
          </div>
          <div style={{ maxHeight: 260, overflowY: 'auto' }}>
            {recentWork.map((w) => (
              <div key={w._id} style={{ padding: '10px 16px', borderBottom: `1px solid ${theme.colors.border}`, display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
                <span style={{ fontWeight: 600, color: theme.colors.muted, fontFamily: 'monospace', minWidth: 78 }}>{new Date(w.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                <span style={{ flex: 1, color: theme.colors.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.description}</span>
                <Badge variant={w.status === 'APPROVED' ? 'success' : w.status === 'REJECTED' ? 'danger' : 'warning'}>{w.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function MiniStat({ icon, label, value, color }) {
  return (
    <div style={{ background: theme.colors.surface, borderRadius: theme.radius.md, border: `1px solid ${theme.colors.border}`, padding: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}15`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{icon}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 10, color: theme.colors.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.3 }}>{label}</div>
        <div style={{ fontSize: 13, fontWeight: 700, color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</div>
      </div>
    </div>
  );
}