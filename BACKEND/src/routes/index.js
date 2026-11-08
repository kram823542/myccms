import { Router } from 'express';

import authRoutes from '../modules/auth/auth.routes.js';
import userRoutes from '../modules/users/user.routes.js';
import blockRoutes from '../modules/blocks/block.routes.js';
import clfRoutes from '../modules/clfs/clf.routes.js';
import employeeRoutes from '../modules/employees/employee.routes.js';
import actionPlanRoutes from '../modules/actionPlans/actionPlan.routes.js';
import workDoneRoutes from '../modules/workDone/workDone.routes.js';
import attendanceRoutes from '../modules/attendance/attendance.routes.js';
import notificationRoutes from '../modules/notifications/notification.routes.js';
import reportRoutes from '../modules/reports/report.routes.js';
import auditRoutes from '../modules/auditLogs/auditLog.routes.js';
import adviceRoutes from '../modules/advice/advice.routes.js';
import leaveRoutes from '../modules/leaves/leave.routes.js';


// ✅ NEW: CLF Resources (Lokos CRP + VO)
import clfResourceRoutes from '../modules/clfResources/clfResource.routes.js';
import submissionWindowRoutes from '../modules/submissionWindows/submissionWindows.routes.js';
// routes/index.js — ADD this line at the bottom (before export)
import systemRoutes from '../modules/system/system.routes.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/blocks', blockRoutes);
router.use('/clfs', clfRoutes);
router.use('/employees', employeeRoutes);
router.use('/action-plans', actionPlanRoutes);
router.use('/work-done', workDoneRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/notifications', notificationRoutes);
router.use('/reports', reportRoutes);
router.use('/audit-logs', auditRoutes);
router.use('/advice', adviceRoutes);
router.use('/leaves', leaveRoutes);
router.use('/submission-windows', submissionWindowRoutes);
router.use('/system', systemRoutes);



// ✅ NEW: mount clf-resources
router.use('/clf-resources', clfResourceRoutes);
export default router;