import apiClient from '../../services/apiClient.js';

export const listClfs = (params) => apiClient.get('/clfs', { params });
export const getClf = (id) => apiClient.get(`/clfs/${id}`);
export const createClf = (payload) => apiClient.post('/clfs', payload);
export const bpmDashboard = () => apiClient.get('/clfs/dashboard/bpm');

//  FIXED: Flattened data payload for reset
export const resetClfPassword = (id, data) =>
  apiClient.post(`/clfs/${id}/reset-password`, data);

export const updateClfBod = (id, payload) => 
  apiClient.put(`/clfs/${id}/bod`, payload);