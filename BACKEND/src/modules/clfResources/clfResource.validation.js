import { body, param } from 'express-validator';

/* ─── Lokos CRP ─── */
export const createLokosValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 120 }),
  body('village').trim().notEmpty().withMessage('Village is required').isLength({ max: 120 }),
  body('designation').optional().isString().trim().isLength({ max: 120 }),
  body('mobile')
    .trim()
    .notEmpty()
    .withMessage('Mobile is required')
    .isLength({ min: 10, max: 15 })
    .withMessage('Mobile must be 10–15 digits'),
  body('accountNumber').optional().isString().trim().isLength({ max: 30 }),
  body('bankName').optional().isString().trim().isLength({ max: 120 }),
  body('ifscCode')
    .optional()
    .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/i)
    .withMessage('Invalid IFSC code'),
];

export const updateLokosValidation = [
  param('id').isMongoId(),
  body('name').optional().trim().isLength({ max: 120 }),
  body('village').optional().trim().isLength({ max: 120 }),
  body('designation').optional().isString().trim().isLength({ max: 120 }),
  body('mobile').optional().trim().isLength({ min: 10, max: 15 }),
  body('accountNumber').optional().isString().trim().isLength({ max: 30 }),
  body('bankName').optional().isString().trim().isLength({ max: 120 }),
  body('ifscCode')
    .optional()
    .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/i)
    .withMessage('Invalid IFSC code'),
  body('status').optional().isIn(['ACTIVE', 'INACTIVE']),
];

/* ─── VO ─── */
const memberValidation = (prefix) => [
  body(`${prefix}.name`).optional().isString().trim().isLength({ max: 120 }),
  body(`${prefix}.village`).optional().isString().trim().isLength({ max: 120 }),
  body(`${prefix}.phone`).optional().isString().trim().isLength({ max: 15 }),
];

export const createVoValidation = [
  body('voName').trim().notEmpty().withMessage('VO name is required').isLength({ max: 120 }),
  body('accountNumber').optional().isString().trim().isLength({ max: 30 }),
  body('bankName').optional().isString().trim().isLength({ max: 120 }),
  body('ifscCode')
    .optional()
    .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/i)
    .withMessage('Invalid IFSC code'),
  ...memberValidation('sachiv'),
  ...memberValidation('adhyaksh'),
  ...memberValidation('koshaAdhyaksh'),
];

export const updateVoValidation = [
  param('id').isMongoId(),
  body('voName').optional().trim().isLength({ max: 120 }),
  body('accountNumber').optional().isString().trim().isLength({ max: 30 }),
  body('bankName').optional().isString().trim().isLength({ max: 120 }),
  body('ifscCode')
    .optional()
    .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/i)
    .withMessage('Invalid IFSC code'),
  body('status').optional().isIn(['ACTIVE', 'INACTIVE']),
  ...memberValidation('sachiv'),
  ...memberValidation('adhyaksh'),
  ...memberValidation('koshaAdhyaksh'),
];