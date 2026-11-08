import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader.jsx';
import Badge from '../components/ui/Badge.jsx';
import { getAuthUser, setAuthUser } from '../utils/authStorage.js';
import { theme } from '../config/theme.js';
import * as actionApi from '../features/actionPlans/actionPlans.api.js';
import * as workApi from '../features/workDone/workDone.api.js';
import * as attendanceApi from '../features/attendance/attendance.api.js';
import * as notificationApi from '../features/notifications/notifications.api.js';
import { getEmployee } from '../features/employees/employees.api.js'; 
import { useSubmissionWindows } from '../hooks/useSubmissionWindows.js';
import { formatSubmissionWindow } from '../utils/submissionWindow.js';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
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

function EmployeeDashboardCard({ to, title, subtitle, color, badge, badgeVariant }) {
  return (
    <Link
      to={to}
      style={{ textDecoration: 'none', background: theme.colors.surface, borderRadius: theme.radius.md, padding: 16, boxShadow: theme.shadow.sm, border: `1px solid ${theme.colors.border}`, borderLeft: `4px solid ${color}`, color: theme.colors.text, display: 'block', transition: 'transform 0.15s ease, box-shadow 0.15s ease', position: 'relative', boxSizing: 'border-box' }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = theme.shadow.md; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = theme.shadow.sm; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>{title}</div>
        {badge && <Badge variant={badgeVariant || 'default'}>{badge}</Badge>}
      </div>
      <div style={{ fontSize: 12, color: theme.colors.muted, marginTop: 6, lineHeight: 1.4 }}>
        {subtitle}
      </div>
    </Link>
  );
}

export default function EmployeeDashboard() {
  const user = getAuthUser() || {};
  const greeting = getGreeting();
  const { windows } = useSubmissionWindows();
  const currentWindow = windows?.actionPlan?.isOpen
    ? 'ACTION_PLAN_OPEN'
    : windows?.workDone?.isOpen
      ? 'WORK_DONE_OPEN'
      : 'CLOSED';

  const [todayPlan, setTodayPlan] = useState(null);
  const [todayWork, setTodayWork] = useState(null);
  const [monthAttendance, setMonthAttendance] = useState({ present: 0, absent: 0, total: 0 });
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentWork, setRecentWork] = useState([]);
  const [employeeData, setEmployeeData] = useState(null);

  useEffect(() => {
    const load = async () => {
      const today = getTodayStr();
      const { start, end } = getMonthRange();

      await Promise.all([
        getEmployee(user.employeeId)
          .then(({ data }) => {
            setEmployeeData(data.data);
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

    };
    load();
  }, [user.employeeId]);

  const displayName = employeeData?.name || user.name || 'Employee';

  const planBadge = todayPlan ? { text: 'Submitted', variant: 'success' } : currentWindow === 'ACTION_PLAN_OPEN' ? { text: 'Submit Now', variant: 'warning' } : { text: 'Not Submitted', variant: 'default' };
  const workBadge = todayWork ? { text: todayWork.status, variant: todayWork.status === 'APPROVED' ? 'success' : todayWork.status === 'REJECTED' ? 'danger' : 'warning' } : currentWindow === 'WORK_DONE_OPEN' ? { text: 'Submit Now', variant: 'warning' } : { text: 'Not Submitted', variant: 'default' };

  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>
      <PageHeader title={`${greeting}, ${displayName} `} subtitle="What would you like to do today?" />
      
      {currentWindow !== 'CLOSED' && (
        <div style={{ background: `linear-gradient(90deg, ${theme.colors.primary}15, ${theme.colors.secondary}10)`, border: `1px solid ${theme.colors.primary}40`, borderRadius: theme.radius.md, padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, fontWeight: 600, color: theme.colors.primary, boxSizing: 'border-box' }}>
          <span style={{ fontSize: 15 }}></span>
          <span>
            {currentWindow === 'ACTION_PLAN_OPEN' && `Action Plan window is open — ${formatSubmissionWindow(windows.actionPlan)} IST`}
            {currentWindow === 'WORK_DONE_OPEN' && `Work Done window is open — ${formatSubmissionWindow(windows.workDone)} IST`}
          </span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 16 }}>
        <MiniStat icon="" label="Today's Plan" value={todayPlan ? 'Done' : 'Pending'} color={todayPlan ? theme.colors.success : theme.colors.warning} />
        <MiniStat icon="" label="Today's Work" value={todayWork ? todayWork.status === 'APPROVED' ? 'Approved' : todayWork.status === 'REJECTED' ? 'Rejected' : 'Pending' : 'Not Done'} color={todayWork?.status === 'APPROVED' ? theme.colors.success : todayWork?.status === 'REJECTED' ? theme.colors.danger : theme.colors.warning} />
        <MiniStat icon="" label="This Month" value={`${monthAttendance.present}P / ${monthAttendance.absent}A`} color={theme.colors.info} />
        <MiniStat icon="" label="Notifications" value={unreadCount > 0 ? `${unreadCount} New` : 'All Read'} color={unreadCount > 0 ? theme.colors.danger : theme.colors.success} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 20 }}>
        <EmployeeDashboardCard to="/employee/work" title=" Today's Action Plan" subtitle={todayPlan ? ` Submitted at ${new Date(todayPlan.submittedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` : windows ? `Submit between ${formatSubmissionWindow(windows.actionPlan)} IST` : 'Submission time unavailable'} color={theme.colors.primary} badge={planBadge.text} badgeVariant={planBadge.variant} />
        <EmployeeDashboardCard to="/employee/work" title=" Today's Work Done" subtitle={todayWork ? todayWork.status === 'REJECTED' ? ` Rejected` : `${todayWork.status === 'APPROVED' ? ' Approved' : ' Pending'}` : windows ? `Submit between ${formatSubmissionWindow(windows.workDone)} IST` : 'Submission time unavailable'} color={theme.colors.success} badge={workBadge.text} badgeVariant={workBadge.variant} />
        <EmployeeDashboardCard to="/employee/attendance" title=" My Attendance" subtitle={`${monthAttendance.present} Present, ${monthAttendance.absent} Absent this month`} color={theme.colors.info} />
        <EmployeeDashboardCard to="/employee/notifications" title=" Notifications" subtitle={unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'All caught up!'} color={theme.colors.accent} badge={unreadCount > 0 ? `${unreadCount}` : null} badgeVariant="danger" />
      </div>

      {recentWork.length > 0 && (
        <div style={{ background: theme.colors.surface, borderRadius: theme.radius.md, boxShadow: theme.shadow.sm, border: `1px solid ${theme.colors.border}`, overflow: 'hidden', boxSizing: 'border-box' }}>
          <div style={{ padding: '12px 14px', borderBottom: `1px solid ${theme.colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: theme.colors.text }}> Recent Work Submissions</h3>
            <Link to="/employee/work" style={{ fontSize: 11, fontWeight: 700, color: theme.colors.primary, textDecoration: 'none' }}>View All →</Link>
          </div>
          
          {/* Responsive Card View for History */}
          <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflowY: 'auto' }}>
            {recentWork.map((w) => (
              <div key={w._id} style={{ background: theme.colors.background, border: `1px solid ${theme.colors.border}`, borderRadius: 8, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6, boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: theme.colors.muted }}> {new Date(w.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  <Badge variant={w.status === 'APPROVED' ? 'success' : w.status === 'REJECTED' ? 'danger' : 'warning'}>{w.status}</Badge>
                </div>
                <div style={{ fontSize: 12, color: theme.colors.text, wordBreak: 'break-word', lineHeight: 1.4 }}>
                  {w.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MiniStat({ icon, label, value, color }) {
  return (
    <div style={{ background: theme.colors.surface, borderRadius: theme.radius.md, border: `1px solid ${theme.colors.border}`, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8, boxSizing: 'border-box' }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}15`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>{icon}</div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 9, color: theme.colors.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.3 }}>{label}</div>
        <div style={{ fontSize: 12, fontWeight: 700, color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</div>
      </div>
    </div>
  );
}