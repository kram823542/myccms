import { body } from 'express-validator';

export const createBPMValidation = [
  body('username')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters'),
    
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required'),
    
  // ✅ FIX: blockId ko completely optional kar diya
  body('blockId')
    .optional({ checkFalsy: true })
    .isMongoId()
    .withMessage('Invalid Block ID format'),
    
  // ✅ FIX: Email/Mobile optional aur lenient
  body('email')
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage('Invalid email address'),
    
  body('mobile')
    .optional({ checkFalsy: true })
    .isLength({ min: 10 })
    .withMessage('Mobile number must be at least 10 digits'),
];

export const setStatusValidation = [
  body('status').isIn(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
];

export const changeBlockValidation = [body('blockId').isMongoId()];