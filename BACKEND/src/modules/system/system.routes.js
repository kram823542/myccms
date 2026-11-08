// modules/system/system.routes.js
import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as ctrl from './system.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/authorize.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';

const router = Router();
router.use(authenticate);
router.use(authorize('SUPER_ADMIN'));

/* ─── System state ─── */
router.get('/state', ctrl.getState);
router.patch(
  '/toggle',
  [body('isOffline').isBoolean().withMessage('isOffline must be boolean')],
  validate,
  ctrl.toggle
);

/* ─── Backup / Wipe / Restore ─── */
router.get('/backup', ctrl.backupDownload);
router.post(
  '/wipe',
  [body('backupId').isString().notEmpty().withMessage('backupId required')],
  validate,
  ctrl.wipe
);
router.post('/restore', ctrl.restore); // raw JSON body — mount-time parser
// ✅ NAYA ROUTE: Drop all indexes to free up storage
router.post('/drop-indexes', ctrl.dropIndexes);

/* ─── Collection browser ─── */
router.get('/collections', ctrl.listCollections);
router.get(
  '/collections/:collection',
  [
    param('collection').isString().isLength({ min: 1, max: 60 }),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 200 }),
  ],
  validate,
  ctrl.listDocs
);
router.get(
  '/collections/:collection/:id',
  [param('collection').isString(), param('id').isMongoId()],
  validate,
  ctrl.getDoc
);
router.patch(
  '/collections/:collection/:id',
  [param('collection').isString(), param('id').isMongoId()],
  validate,
  ctrl.updateDoc
);
router.delete(
  '/collections/:collection/:id',
  [param('collection').isString(), param('id').isMongoId()],
  validate,
  ctrl.deleteDoc
);

export default router;