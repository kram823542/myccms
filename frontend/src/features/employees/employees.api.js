import apiClient from '../../services/apiClient.js';
import { listAllEmployees } from './listAllEmployees.js';

export const listEmployees = (params) => apiClient.get('/employees', { params });
export const listAllEmployeesInScope = (params) => listAllEmployees(listEmployees, params);
export const getEmployee = (id) => apiClient.get(`/employees/${id}`);
export const createEmployee = (payload) => apiClient.post('/employees', payload);
export const updateEmployee = (id, payload) => apiClient.patch(`/employees/${id}`, payload);
export const setEmployeeStatus = (id, status) =>
  apiClient.patch(`/employees/${id}/status`, { status });

//  FIXED: Flattened data payload for reset
export const resetEmployeePassword = (id, data) =>
  apiClient.post(`/employees/${id}/reset-password`, data);

export const deleteEmployee = (id) => apiClient.delete(`/employees/${id}`);
export const getCredentials = () => apiClient.get('/employees/credentials');