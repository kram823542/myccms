import { Router } from 'express';
import * as ctrl from './clf.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/authorize.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { createCLFValidation } from './clf.validation.js';

const router = Router();

router.use(authenticate);

router.get('/dashboard/bpm', authorize('BPM'), ctrl.bpmDashboard);
router.get('/', authorize('SUPER_ADMIN', 'BPM'), ctrl.list);

// ✅ FIX: Employee ko CLF dekhne ki permission di (leave letter ke liye zaroori)
router.get('/:id', authorize('SUPER_ADMIN', 'BPM', 'CLF', 'EMPLOYEE'), ctrl.getOne);

router.post('/', authorize('SUPER_ADMIN', 'BPM'), createCLFValidation, validate, ctrl.create);

// ✅ NAYA: CLF apne BOD members update kare
router.put(
  '/:id/bod',
  authorize('CLF', 'SUPER_ADMIN'),
  ctrl.updateBod
);

router.post(
  '/:id/reset-password',
  authorize('BPM', 'SUPER_ADMIN'),
  ctrl.resetPassword
);

export default router;