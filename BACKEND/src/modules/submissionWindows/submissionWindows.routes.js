import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { getSubmissionWindows } from './submissionWindows.controller.js';

const router = Router();

router.get('/', authenticate, getSubmissionWindows);

export default router;
