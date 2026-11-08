import apiClient from '../../services/apiClient.js';

export const listUsers = (params) => apiClient.get('/users', { params });
export const createBPM = (payload) => apiClient.post('/users/bpm', payload);

//  FIXED: Flattened data payload for reset
export const resetPassword = (id, data) =>
  apiClient.post(`/users/${id}/reset-password`, data);
  
export const setStatus = (id, status) => apiClient.patch(`/users/${id}/status`, { status });
export const changeBlock = (id, blockId) => apiClient.patch(`/users/${id}/block`, { blockId });