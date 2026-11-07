// import { Router } from 'express';
// import * as ctrl from './clfResource.controller.js';
// import { authenticate } from '../../middlewares/auth.middleware.js';
// import { authorize } from '../../middlewares/authorize.middleware.js';
// import { validate } from '../../middlewares/validate.middleware.js';
// import {
//   createLokosValidation,
//   updateLokosValidation,
//   createVoValidation,
//   updateVoValidation,
// } from './clfResource.validation.js';

// const router = Router();
// router.use(authenticate);

// router.get('/lokos', authorize('BPM', 'CLF'), ctrl.listLokos);
// router.post('/lokos', authorize('CLF'), createLokosValidation, validate, ctrl.createLokos);
// router.patch('/lokos/:id', authorize('CLF'), updateLokosValidation, validate, ctrl.updateLokos);
// router.delete('/lokos/:id', authorize('CLF'), ctrl.deleteLokos);

// router.get('/vos', authorize('BPM', 'CLF'), ctrl.listVos);
// router.post('/vos', authorize('CLF'), createVoValidation, validate, ctrl.createVo);
// router.patch('/vos/:id', authorize('CLF'), updateVoValidation, validate, ctrl.updateVo);
// router.delete('/vos/:id', authorize('CLF'), ctrl.deleteVo);

// export default router;



// import { Router } from 'express';
// import * as ctrl from './clfResource.controller.js';
// import { authenticate } from '../../middlewares/auth.middleware.js';
// import { authorize } from '../../middlewares/authorize.middleware.js';
// import { validate } from '../../middlewares/validate.middleware.js';
// import {
//   createLokosValidation,
//   updateLokosValidation,
//   createVoValidation,
//   updateVoValidation,
// } from './clfResource.validation.js';

// const router = Router();
// router.use(authenticate);

// // ✅ Lokos Routes
// router.get('/lokos', authorize('BPM', 'CLF'), ctrl.listLokos);
// router.post('/lokos', authorize('CLF'), createLokosValidation, validate, ctrl.createLokos);
// router.patch('/lokos/:id', authorize('CLF'), updateLokosValidation, validate, ctrl.updateLokos);
// router.delete('/lokos/:id', authorize('CLF'), ctrl.deleteLokos);

// // ✅ VO Routes
// router.get('/vos', authorize('BPM', 'CLF'), ctrl.listVos);
// router.post('/vos', authorize('CLF'), createVoValidation, validate, ctrl.createVo);
// router.patch('/vos/:id', authorize('CLF'), updateVoValidation, validate, ctrl.updateVo);
// router.delete('/vos/:id', authorize('CLF'), ctrl.deleteVo);

// // ✅ Generate Advice Route
// // router.post('/generate-advice', authorize('CLF'), ctrl.generateResourceAdvice);
// router.post('/generate-advice', authorize('CLF'), ctrl.generateResourceAdvice);

// export default router;



import { Router } from 'express';
import * as ctrl from './clfResource.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/authorize.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  createLokosValidation,
  updateLokosValidation,
  createVoValidation,
  updateVoValidation,
} from './clfResource.validation.js';

const router = Router();
router.use(authenticate);

// ✅ Lokos Routes
router.get('/lokos', authorize('BPM', 'CLF'), ctrl.listLokos);
router.post('/lokos', authorize('CLF'), createLokosValidation, validate, ctrl.createLokos);
router.patch('/lokos/:id', authorize('CLF'), updateLokosValidation, validate, ctrl.updateLokos);
router.delete('/lokos/:id', authorize('CLF'), ctrl.deleteLokos);

// ✅ VO Routes
router.get('/vos', authorize('BPM', 'CLF'), ctrl.listVos);
router.post('/vos', authorize('CLF'), createVoValidation, validate, ctrl.createVo);
router.patch('/vos/:id', authorize('CLF'), updateVoValidation, validate, ctrl.updateVo);
router.delete('/vos/:id', authorize('CLF'), ctrl.deleteVo);

// ✅ Advice Generate Route (Yahan error aa raha tha)
router.post('/generate-advice', authorize('CLF'), ctrl.generateResourceAdvice);

export default router;