import { Router } from 'express';
import multer from 'multer';
import * as ctrl from './workDone.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/authorize.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { submissionLimiter } from '../../middlewares/rateLimit.middleware.js';
import { submitValidation, rejectValidation } from './workDone.validation.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    // ✅ CHANGED: Agar image nahi bhi bheji toh chalega (optional)
    if (!file) return cb(null, true);
    if (!/^image\/(jpeg|png|jpg|webp)$/.test(file.mimetype)) {
      return cb(new Error('Only JPG/PNG/WEBP images allowed'));
    }
    cb(null, true);
  },
});

const router = Router();
router.use(authenticate);

router.post(
  '/',
  authorize('EMPLOYEE'),
  submissionLimiter,
  upload.single('image'), // ✅ Optional — file nahi bhi aaye toh chalega
  submitValidation,
  validate,
  ctrl.submit
);
router.get('/', authorize('SUPER_ADMIN', 'BPM', 'CLF', 'EMPLOYEE'), ctrl.list);
router.get('/pending', authorize('CLF'), ctrl.pending);
router.patch('/:id/approve', authorize('CLF'), ctrl.approve);
router.patch('/:id/reject', authorize('CLF'), rejectValidation, validate, ctrl.reject);

export default router;