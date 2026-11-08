import apiClient from '../../services/apiClient.js';

export const getMyProfile = () => apiClient.get('/auth/me');

//  NAYA: FormData handle karega
export const updateMyProfile = (formData) => 
  apiClient.patch('/auth/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

export const changeMyPassword = (payload) => apiClient.post('/auth/change-password', payload);
export const logout = () => apiClient.post('/auth/logout');