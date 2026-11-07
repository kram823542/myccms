import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './guards/ProtectedRoute.jsx';
import RoleGuard from './guards/RoleGuard.jsx';
import Profile from '../features/profile/Profile.jsx';

import AuthLayout from '../layouts/AuthLayout.jsx';
import SuperAdminLayout from '../layouts/SuperAdminLayout.jsx';
import BpmLayout from '../layouts/BpmLayout.jsx';
import ClfLayout from '../layouts/ClfLayout.jsx';
import EmployeeLayout from '../layouts/EmployeeLayout.jsx';

import LeavePage from '../features/leaves/LeavePage';
import AdminLeavePage from '../features/leaves/AdminLeavePage';

import Login from '../features/auth/Login.jsx';

import SuperAdminDashboard from '../dashboards/SuperAdminDashboard.jsx';
import BpmDashboard from '../dashboards/BpmDashboard.jsx';
import ClfDashboard from '../dashboards/ClfDashboard.jsx';
import EmployeeDashboard from '../dashboards/EmployeeDashboard.jsx';

import UsersPage from '../features/users/UsersPage.jsx';
import BlocksPage from '../features/blocks/BlocksPage.jsx';
import ClfsPage from '../features/clfs/ClfsPage.jsx';
import EmployeesPage from '../features/employees/EmployeesPage.jsx';
import EmployeeProfilePage from '../features/employees/EmployeeProfilePage.jsx';
import ActionPlansPage from '../features/actionPlans/ActionPlansPage.jsx';
import WorkDonePage from '../features/workDone/WorkDonePage.jsx';
import WorkDoneApprovalPage from '../features/workDone/WorkDoneApprovalPage.jsx';
import AttendancePage from '../features/attendance/AttendancePage.jsx';
import NotificationsPage from '../features/notifications/NotificationsPage.jsx';
import ReportsPage from '../features/reports/ReportsPage.jsx';
import AuditLogsPage from '../features/auditLogs/AuditLogsPage.jsx';
import Advice from '../features/advice/Advice.jsx';   
// ✅ Import karo
import ClfResourcesPage from '../features/clfResources/ClfResourcesPage.jsx';

// ✅ NAYA: TopSheet import kiya
import TopSheet from '../features/advice/TopSheet.jsx'; 

import Work from '../features/work/Work.jsx';

export default function AppRouter() {
  return (
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
        <Route path="/clf/work-done/approval" element={<WorkDoneApprovalPage />} />
        <Route path="/clf/advice" element={<Advice />} />   
        
        {/* ✅ FIXED: Top Sheet Route add kiya */}
        <Route path="/clf/topsheet" element={<TopSheet />} /> 
        // ✅ CLF Layout ke andar add karo
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
  );
}