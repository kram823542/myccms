import apiClient from '../../services/apiClient';

//  Nayi Leave Apply karne ke liye
export const applyLeaveApi = async (data) => {
  const response = await apiClient.post('/leaves/apply', data);
  return response.data;
};

//  Apni saari leaves dekhne ke liye
export const getMyLeavesApi = async () => {
  const response = await apiClient.get('/leaves/my-leaves');
  return response.data;
};

//  Pending leave cancel karne ke liye
export const cancelLeaveApi = async (id) => {
  const response = await apiClient.delete(`/leaves/${id}`);
  return response.data;
};


//  NAYA: Admin ke liye
export const getAllLeavesApi = async () => {
  const response = await apiClient.get('/leaves/admin/all');
  return response.data;
};



//  NAYA: CLF Admin ke liye status update karne ka function
export const updateLeaveStatusApi = async (id, status, reviewRemarks) => {
  const response = await apiClient.put(`/leaves/admin/${id}/status`, { status, reviewRemarks });
  return response.data;
};



//  NAYA: Backend se PDF download karne ka function
export const downloadLeavePdfApi = async (id) => {
  const response = await apiClient.get(`/leaves/${id}/download-pdf`, {
    responseType: 'blob', // Ye sabse important hai PDF ke liye
  });
  return response.data;
};