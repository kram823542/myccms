import apiClient from '../../services/apiClient.js';

export const getSubmissionWindows = () => apiClient.get('/submission-windows');
