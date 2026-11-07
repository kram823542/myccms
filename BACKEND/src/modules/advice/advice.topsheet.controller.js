import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import * as topsheetService from './advice.topsheet.service.js';

export const generateTopSheet = asyncHandler(async (req, res) => {
  const { clfId, month, adviceDetails, selectedBank } = req.body;

  if (!clfId || !month) {
    throw ApiError.badRequest('clfId and month (YYYY-MM) are required');
  }

  // Agar user CLF hai, toh uske khud ka clfId use karo
  const targetClfId = req.user.role === 'CLF' ? req.user.clfId : clfId;

  await topsheetService.generateTopSheetPDF(
    req,
    targetClfId,
    month,
    adviceDetails || [],
    selectedBank,
    res
  );
});