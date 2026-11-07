import express from 'express';
import { body, param } from 'express-validator';
import {
  applyLeave,
  getMyLeaves,
  cancelLeave,
  getAllLeavesForAdmin,
  updateLeaveStatus,
  downloadLeavePDF,
} from './leave.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/authorize.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';

const router = express.Router();
router.use(authenticate);

// ✅ FIX #7: Validation add
// ✅ NEW: 'Training' leave type add kiya
const applyValidation = [
  body('leaveType').isIn(['Casual Leave', 'Medical Leave', 'Half Day', 'Emergency Leave', 'Training', 'Other']),
  body('startDate').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('startDate must be YYYY-MM-DD'),
  body('endDate').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('endDate must be YYYY-MM-DD'),
  body('reason').trim().isLength({ min: 3, max: 1000 }),
  body('startTime').if(body('leaveType').equals('Half Day')).notEmpty().withMessage('startTime required for Half Day'),
  body('endTime').if(body('leaveType').equals('Half Day')).notEmpty().withMessage('endTime required for Half Day'),
];

const statusValidation = [
  param('id').isMongoId(),
  body('status').isIn(['APPROVED', 'REJECTED']),
  body('reviewRemarks').optional().isString().isLength({ max: 1000 }),
];

// Employee routes
router.post('/apply', authorize('EMPLOYEE'), applyValidation, validate, applyLeave);
router.get('/my-leaves', authorize('EMPLOYEE'), getMyLeaves);
router.delete('/:id', authorize('EMPLOYEE'), param('id').isMongoId(), validate, cancelLeave);

// ✅ FIX #3 (P0 SECURITY): Admin routes pe authorize() add
router.get('/admin/all', authorize('CLF', 'BPM', 'SUPER_ADMIN'), getAllLeavesForAdmin);
router.put(
  '/admin/:id/status',
  authorize('CLF', 'BPM', 'SUPER_ADMIN'),
  statusValidation,
  validate,
  updateLeaveStatus
);

// PDF download
router.get(
  '/:id/download-pdf',
  authorize('EMPLOYEE', 'CLF', 'BPM', 'SUPER_ADMIN'),
  param('id').isMongoId(),
  validate,
  downloadLeavePDF
);

export default router;