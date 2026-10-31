import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js'; // ✅ NAYA: ApiError import kiya
import { TopSheet } from './topSheet.model.js'; // ✅ NAYA: TopSheet model import kiya
import * as service from './advice.service.js';

export const create = asyncHandler(async (req, res) => {
  const advice = await service.createAdvice(req, req.body);
  res.status(201).json({ success: true, data: advice });
});

export const list = asyncHandler(async (req, res) => {
  const result = await service.listAdvices(req, req.query);
  res.json({ success: true, data: result });
});

export const getOne = asyncHandler(async (req, res) => {
  const advice = await service.getAdvice(req, req.params.id);
  res.json({ success: true, data: advice });
});

export const remove = asyncHandler(async (req, res) => {
  const result = await service.deleteAdvice(req, req.params.id);
  res.json({ success: true, data: result });
});

/** ✅ PDF — ?mode=print → inline (browser print), ?mode=download → attachment */
export const downloadPDF = asyncHandler(async (req, res) => {
  const inline = req.query.mode === 'print';
  await service.generateAdvicePDF(req, req.params.id, res, { inline });
});

/** ✅ CLF Members fetch */
export const getClfMembers = asyncHandler(async (req, res) => {
  const { clfId } = req.params;
  const members = await service.getClfMembersForAdvice(clfId);
  res.json({ success: true, data: members });
});

// ✅ NAYA: Top Sheet History Fetch Function
export const getTopSheetHistory = asyncHandler(async (req, res) => {
  const clfId = req.user.role === 'CLF' ? req.user.clfId : req.query.clfId;
  if (!clfId) throw ApiError.badRequest('CLF ID required');

  const history = await TopSheet.find({ clfId }).sort({ createdAt: -1 }).limit(50);
  res.json({ success: true, data: history });
});