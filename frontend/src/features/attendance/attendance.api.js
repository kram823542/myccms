import apiClient from '../../services/apiClient.js';

export const listAttendance = (params) =>
  apiClient.get('/attendance', { params });

//  Matrix format Excel (backend reports route)
export const exportAttendanceCSV = (params) =>
  apiClient.get('/reports/attendance-excel', { params, responseType: 'blob' });