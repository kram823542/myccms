import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import * as topsheetService from './advice.topsheet.service.js';
import { TopSheet } from './topSheet.model.js';

export const generateTopSheet = asyncHandler(async (req, res) => {
  const { clfId, month, adviceDetails, selectedBank } = req.body; // ✅ selectedBank add kiya

  if (!clfId || !month) {
    throw ApiError.badRequest('clfId and month (YYYY-MM) are required');
  }

  const targetClfId = req.user.role === 'CLF' ? req.user.clfId : clfId;

  await topsheetService.generateTopSheetPDF(
    req,
    targetClfId,
    month,
    adviceDetails || [],
    selectedBank, // ✅ Pass kiya
    res
  );
});

export const getTopSheetHistory = asyncHandler(async (req, res) => {
  const clfId = req.user.role === 'CLF' ? req.user.clfId : req.query.clfId;
  if (!clfId) throw ApiError.badRequest('CLF ID required');

  const history = await TopSheet.find({ clfId }).sort({ createdAt: -1 }).limit(50);
  
  res.json({ success: true, data: history });
});