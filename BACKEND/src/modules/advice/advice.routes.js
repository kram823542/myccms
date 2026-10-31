import { Router } from 'express';
import { body } from 'express-validator';
import * as ctrl from './advice.controller.js';
import * as topsheetCtrl from './advice.topsheet.controller.js'; // ✅ Sirf ek baar import
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/authorize.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';

const router = Router();
router.use(authenticate);

const createValidation = [
  body('adviceType').optional().isIn(['SALARY', 'EXPENSE']),
  body('adviceDate').optional().isISO8601(),
  body('adviceNumber')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 60 })
    .withMessage('adviceNumber max 60 chars'),
  body('employees').isArray({ min: 1 }).withMessage('At least one employee required'),
  body('employees.*.name').trim().notEmpty().withMessage('Name required'),
  body('employees.*.amount').isFloat({ gt: 0 }).withMessage('Amount must be > 0'),
  body('employees.*.designation').optional().isString().trim(),
  body('employees.*.month').optional().isString(),
  body('employees.*.bankAccountNumber').optional().isString(),
  body('employees.*.bankName').optional().isString(),
  body('employees.*.branch').optional().isString(),
  body('employees.*.ifscCode').optional().isString(),
];

// ✅ Top Sheet Routes
router.post(
  '/generate-topsheet',
  authorize('CLF', 'BPM', 'SUPER_ADMIN'),
  topsheetCtrl.generateTopSheet
);

// ✅ Top Sheet History Route
router.get(
  '/topsheet-history',
  authorize('CLF', 'BPM', 'SUPER_ADMIN'),
  ctrl.getTopSheetHistory // Note: Controller me getTopSheetHistory export hona chahiye
);

// CLF Members fetch
router.get('/members/:clfId', authorize('CLF', 'BPM', 'SUPER_ADMIN'), ctrl.getClfMembers);

// Standard Advice Routes
router.post('/', authorize('CLF', 'BPM', 'SUPER_ADMIN'), createValidation, validate, ctrl.create);
router.get('/', authorize('CLF', 'BPM', 'SUPER_ADMIN'), ctrl.list);
router.get('/:id', authorize('CLF', 'BPM', 'SUPER_ADMIN'), ctrl.getOne);
router.get('/:id/pdf', authorize('CLF', 'BPM', 'SUPER_ADMIN'), ctrl.downloadPDF);
router.delete('/:id', authorize('CLF', 'BPM', 'SUPER_ADMIN'), ctrl.remove);

export default router;