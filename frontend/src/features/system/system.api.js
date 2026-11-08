// features/system/system.api.js
import apiClient from '../../services/apiClient.js';

/* ─── State / Toggle ─── */
export const getSystemState = () => apiClient.get('/system/state');
export const toggleSystem = (isOffline, offlineMessage) =>
  apiClient.patch('/system/toggle', { isOffline, offlineMessage });

/* ─── Backup / Wipe / Restore ─── */
export const downloadBackup = () =>
  apiClient.get('/system/backup', { responseType: 'blob' });

export const wipeDatabase = (backupId) =>
  apiClient.post('/system/wipe', { backupId });

export const restoreDatabase = (backupJson) =>
  apiClient.post('/system/restore', backupJson, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 5 * 60 * 1000, // 5 min for large backups
  });

/* ─── Collection Browser ─── */
export const listCollections = () => apiClient.get('/system/collections');

export const listDocs = (collection, params) =>
  apiClient.get(`/system/collections/${collection}`, { params });

export const getDoc = (collection, id) =>
  apiClient.get(`/system/collections/${collection}/${id}`);

export const updateDoc = (collection, id, payload) =>
  apiClient.patch(`/system/collections/${collection}/${id}`, payload);

export const deleteDoc = (collection, id) =>
  apiClient.delete(`/system/collections/${collection}/${id}`);


export const dropIndexes = () => apiClient.post('/system/drop-indexes');