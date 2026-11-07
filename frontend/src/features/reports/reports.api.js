import apiClient from '../../services/apiClient.js';
import { listAllEmployees } from '../employees/listAllEmployees.js';

export const downloadActionPlanPDF = (params) =>
  apiClient.get('/reports/action-plan', { params, responseType: 'blob' });

export const downloadWorkDonePDF = (params) =>
  apiClient.get('/reports/work-done', { params, responseType: 'blob' });

export const downloadAttendanceExcel = (params) =>
  apiClient.get('/reports/attendance-excel', { params, responseType: 'blob' });

// Fetch employees for reports list (BPM/CLF scope)
export const fetchEmployeesForReports = (params) =>
  apiClient.get('/employees', { params });
export const fetchAllEmployeesForReports = (params) =>
  listAllEmployees(fetchEmployeesForReports, params);