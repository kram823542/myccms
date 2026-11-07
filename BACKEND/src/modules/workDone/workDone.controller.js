import { asyncHandler } from '../../utils/asyncHandler.js';
import * as service from './workDone.service.js';
import { ApiError } from '../../utils/ApiError.js';

// ✅ CHANGED: Image file ab mandatory nahi hai
export const submit = asyncHandler(async (req, res) => {
  // Agar file aayi hai toh buffer pass karo, warna undefined
  const fileBuffer = req.file ? req.file.buffer : null;
  const doc = await service.submitWorkDone(req, req.body, fileBuffer);
  res.status(201).json({ success: true, data: doc });
});

export const list = asyncHandler(async (req, res) => {
  const result = await service.listWorkDone(req, req.query);
  res.json({ success: true, data: result });
});

export const approve = asyncHandler(async (req, res) => {
  const doc = await service.approveWorkDone(req, req.params.id);
  res.json({ success: true, data: doc });
});

export const reject = asyncHandler(async (req, res) => {
  const doc = await service.rejectWorkDone(req, req.params.id, req.body.reason);
  res.json({ success: true, data: doc });
});

export const pending = asyncHandler(async (req, res) => {
  const items = await service.pendingApprovals(req);
  res.json({ success: true, data: items });
});