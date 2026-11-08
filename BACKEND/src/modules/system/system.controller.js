// modules/system/system.controller.js
import { asyncHandler } from '../../utils/asyncHandler.js';
import * as service from './system.service.js';
import { ApiError } from '../../utils/ApiError.js';

/* ════════════════════════════════════════════
   SYSTEM STATE (public read — used by middleware)
   ════════════════════════════════════════════ */
export const getState = asyncHandler(async (req, res) => {
  const state = await service.getSystemState();
  res.json({ success: true, data: state });
});

/* ════════════════════════════════════════════
   TOGGLE ON/OFF
   ════════════════════════════════════════════ */
export const toggle = asyncHandler(async (req, res) => {
  const state = await service.toggleSystem(req, req.body);
  res.json({ success: true, data: state });
});

/* ════════════════════════════════════════════
   BACKUP DOWNLOAD — returns JSON as file
   ════════════════════════════════════════════ */
export const backupDownload = asyncHandler(async (req, res) => {
  const backup = await service.generateBackup(req);

  const filename = `myccms-backup-${new Date().toISOString().split('T')[0]}-${backup.backupId}.json`;

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.status(200).send(JSON.stringify(backup, null, 2));
});

/* ════════════════════════════════════════════
   WIPE
   ════════════════════════════════════════════ */
export const wipe = asyncHandler(async (req, res) => {
  const { backupId } = req.body;
  const result = await service.wipeDatabase(req, { backupId });
  res.json({ success: true, data: result });
});

/* ════════════════════════════════════════════
   RESTORE — expect JSON body (mounted with express.json({ limit: '100mb' }))
   ════════════════════════════════════════════ */
export const restore = asyncHandler(async (req, res) => {
  const backupJson = req.body;
  if (!backupJson || typeof backupJson !== 'object') {
    throw ApiError.badRequest('Expected JSON backup in request body');
  }
  const result = await service.restoreDatabase(req, backupJson);
  res.json({ success: true, data: result });
});

/* ════════════════════════════════════════════
   BROWSE COLLECTIONS
   ════════════════════════════════════════════ */
export const listCollections = asyncHandler(async (req, res) => {
  const data = await service.listCollectionsWithCounts();
  res.json({ success: true, data });
});

/* ════════════════════════════════════════════
   LIST DOCS IN A COLLECTION
   ════════════════════════════════════════════ */
export const listDocs = asyncHandler(async (req, res) => {
  const { collection } = req.params;
  const data = await service.listCollectionDocs(collection, req.query);
  res.json({ success: true, data });
});

/* ════════════════════════════════════════════
   GET / UPDATE / DELETE SINGLE DOC
   ════════════════════════════════════════════ */
export const getDoc = asyncHandler(async (req, res) => {
  const { collection, id } = req.params;
  const data = await service.getSingleDoc(collection, id);
  res.json({ success: true, data });
});

export const updateDoc = asyncHandler(async (req, res) => {
  const { collection, id } = req.params;
  const data = await service.updateSingleDoc(req, collection, id, req.body);
  res.json({ success: true, data });
});

export const deleteDoc = asyncHandler(async (req, res) => {
  const { collection, id } = req.params;
  const data = await service.deleteSingleDoc(req, collection, id);
  res.json({ success: true, data });
});


export const dropIndexes = asyncHandler(async (req, res) => {
  const result = await service.dropAllIndexes(req);
  res.json({ success: true, data: result });
});