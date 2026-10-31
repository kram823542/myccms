import apiClient from '../../services/apiClient.js';

export const createAdvice = (payload) => apiClient.post('/advice', payload);
export const listAdvices = (params) => apiClient.get('/advice', { params });
export const getAdvice = (id) => apiClient.get(`/advice/${id}`);
export const deleteAdvice = (id) => apiClient.delete(`/advice/${id}`);

export const downloadAdvicePDF = (id) =>
  apiClient.get(`/advice/${id}/pdf?mode=download`, { responseType: 'blob' });

export const getAdvicePDFForPrint = (id) =>
  apiClient.get(`/advice/${id}/pdf?mode=print`, { responseType: 'blob' });

export const getClfMembers = (clfId) => apiClient.get(`/advice/members/${clfId}`);

// ✅ Top Sheet Generate API (PDF download ke liye)
export const generateTopSheet = (data) => {
  return apiClient.post('/advice/generate-topsheet', data, {
    responseType: 'blob',
  });
};

// ✅ NAYA: Get TopSheet History (Ek hi baar export)
export const getTopSheetHistory = () => apiClient.get('/advice/topsheet-history');

export const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];