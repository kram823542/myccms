import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './guards/ProtectedRoute.jsx';
import RoleGuard from './guards/RoleGuard.jsx';
import Loader from '../components/ui/Loader.jsx';

import AuthLayout from '../layouts/AuthLayout.jsx';
import SuperAdminLayout from '../layouts/SuperAdminLayout.jsx';
import BpmLayout from '../layouts/BpmLayout.jsx';
import ClfLayout from '../layouts/ClfLayout.jsx';
import EmployeeLayout from '../layouts/EmployeeLayout.jsx';

const Login = lazy(() => import('../features/auth/Login.jsx'));
const Profile = lazy(() => import('../features/profile/Profile.jsx'));
const SuperAdminDashboard = lazy(() => import('../dashboards/SuperAdminDashboard.jsx'));
const BpmDashboard = lazy(() => import('../dashboards/BpmDashboard.jsx'));
const ClfDashboard = lazy(() => import('../dashboards/ClfDashboard.jsx'));
const EmployeeDashboard = lazy(() => import('../dashboards/EmployeeDashboard.jsx'));
const UsersPage = lazy(() => import('../features/users/UsersPage.jsx'));
const BlocksPage = lazy(() => import('../features/blocks/BlocksPage.jsx'));
const ClfsPage = lazy(() => import('../features/clfs/ClfsPage.jsx'));
const EmployeesPage = lazy(() => import('../features/employees/EmployeesPage.jsx'));
const EmployeeProfilePage = lazy(() => import('../features/employees/EmployeeProfilePage.jsx'));
const ActionPlansPage = lazy(() => import('../features/actionPlans/ActionPlansPage.jsx'));
const WorkDonePage = lazy(() => import('../features/workDone/WorkDonePage.jsx'));
const AttendancePage = lazy(() => import('../features/attendance/AttendancePage.jsx'));
const NotificationsPage = lazy(() => import('../features/notifications/NotificationsPage.jsx'));
const ReportsPage = lazy(() => import('../features/reports/ReportsPage.jsx'));
const AuditLogsPage = lazy(() => import('../features/auditLogs/AuditLogsPage.jsx'));
const Advice = lazy(() => import('../features/advice/Advice.jsx'));
const ClfResourcesPage = lazy(() => import('../features/clfResources/ClfResourcesPage.jsx'));
const SystemControl = lazy(() => import('../features/system/SystemControl.jsx'));
const TopSheet = lazy(() => import('../features/advice/TopSheet.jsx'));
const Work = lazy(() => import('../features/work/Work.jsx'));
const LeavePage = lazy(() => import('../features/leaves/LeavePage.jsx'));
const AdminLeavePage = lazy(() => import('../features/leaves/AdminLeavePage.jsx'));

export default function AppRouter() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
      {/* Public */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Super Admin */}
      <Route
        element={
          <ProtectedRoute>
            <RoleGuard allowed={['SUPER_ADMIN']}>
              <SuperAdminLayout />
            </RoleGuard>
          </ProtectedRoute>
        }
      >
        <Route path="/super-admin" element={<SuperAdminDashboard />} />
        <Route path="/super-admin/profile" element={<Profile />} />
        <Route path="/super-admin/users" element={<UsersPage />} />
        <Route path="/super-admin/blocks" element={<BlocksPage />} />
        <Route path="/super-admin/audit-logs" element={<AuditLogsPage />} />
        <Route path="/super-admin/reports" element={<ReportsPage />} />
        <Route path="/super-admin/system" element={<SystemControl />} />
      </Route>

      {/* BPM */}
      <Route
        element={
          <ProtectedRoute>
            <RoleGuard allowed={['BPM']}>
              <BpmLayout />
            </RoleGuard>
          </ProtectedRoute>
        }
      >
        <Route path="/bpm" element={<BpmDashboard />} />
        <Route path="/bpm/clfs" element={<ClfsPage />} />
        <Route path="/bpm/employees" element={<EmployeesPage />} />
        <Route path="/bpm/employees/:id" element={<EmployeeProfilePage />} />
        <Route path="/bpm/work" element={<Work />} />
        <Route path="/bpm/profile" element={<Profile />} />
        <Route path="/bpm/action-plans" element={<ActionPlansPage />} />
        <Route path="/bpm/work-done" element={<WorkDonePage />} />
        <Route path="/bpm/attendance" element={<AttendancePage />} />
        <Route path="/bpm/notifications" element={<NotificationsPage />} />
        <Route path="/bpm/reports" element={<ReportsPage />} />
      </Route>

      {/* CLF */}
      <Route
        element={
          <ProtectedRoute>
            <RoleGuard allowed={['CLF']}>
              <ClfLayout />
            </RoleGuard>
          </ProtectedRoute>
        }
      >
        <Route path="/clf" element={<ClfDashboard />} />
        <Route path="/clf/employees" element={<EmployeesPage />} />
        <Route path="/clf/employees/:id" element={<EmployeeProfilePage />} />
        <Route path="/clf/work" element={<Work />} />
        <Route path="/clf/profile" element={<Profile />} />
        <Route path="/clf/action-plans" element={<ActionPlansPage />} />
        <Route path="/clf/work-done" element={<WorkDonePage />} />
        <Route path="/clf/work-done/approval" element={<WorkDonePage initialTab="pending" key="pending" />} />
        <Route path="/clf/advice" element={<Advice />} />

        {/*  FIXED: Top Sheet Route add kiya */}
        <Route path="/clf/topsheet" element={<TopSheet />} />
        <Route path="/clf/resources" element={<ClfResourcesPage />} />

        <Route path="/clf/attendance" element={<AttendancePage />} />
        <Route path="/clf/notifications" element={<NotificationsPage />} />
        <Route path="/clf/reports" element={<ReportsPage />} />

        <Route path="/clf/leaves" element={<AdminLeavePage />} />
      </Route>

      {/* Employee */}
      <Route
        element={
          <ProtectedRoute>
            <RoleGuard allowed={['EMPLOYEE']}>
              <EmployeeLayout />
            </RoleGuard>
          </ProtectedRoute>
        }
      >
        <Route path="/employee" element={<EmployeeDashboard />} />
        <Route path="/employee/work" element={<Work />} />
        <Route path="/employee/action-plans" element={<ActionPlansPage />} />
        <Route path="/employee/work-done" element={<WorkDonePage />} />
        <Route path="/employee/profile" element={<Profile />} />
        <Route path="/employee/attendance" element={<AttendancePage />} />
        <Route path="/employee/notifications" element={<NotificationsPage />} />
        <Route path="/employee/reports" element={<ReportsPage />} />

        <Route path="/employee/leaves" element={<LeavePage />} />
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}