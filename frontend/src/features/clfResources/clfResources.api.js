// import apiClient from '../../services/apiClient.js';

// /* ─── Lokos CRP ─── */
// export const listLokos = (params) => apiClient.get('/clf-resources/lokos', { params });
// export const getLokos = (id) => apiClient.get(`/clf-resources/lokos/${id}`);
// export const createLokos = (payload) => apiClient.post('/clf-resources/lokos', payload);
// export const updateLokos = (id, payload) => apiClient.patch(`/clf-resources/lokos/${id}`, payload);
// export const deleteLokos = (id) => apiClient.delete(`/clf-resources/lokos/${id}`);

// /* ─── VO ─── */
// export const listVos = (params) => apiClient.get('/clf-resources/vos', { params });
// export const getVo = (id) => apiClient.get(`/clf-resources/vos/${id}`);
// export const createVo = (payload) => apiClient.post('/clf-resources/vos', payload);
// export const updateVo = (id, payload) => apiClient.patch(`/clf-resources/vos/${id}`, payload);
// export const deleteVo = (id) => apiClient.delete(`/clf-resources/vos/${id}`);



import apiClient from '../../services/apiClient.js';
import { getAuthUser } from '../../utils/authStorage.js'; //  User import karo

/* ─── Lokos CRP ─── */
export const listLokos = (params) => apiClient.get('/clf-resources/lokos', { params });

export const getLokos = (id) => apiClient.get(`/clf-resources/lokos/${id}`);

export const createLokos = (payload) => {
  //  Payload me clfId add karo
  const user = getAuthUser() || {};
  const finalPayload = {
    ...payload,
    clfId: payload.clfId || user.clfId, 
  };
  return apiClient.post('/clf-resources/lokos', finalPayload);
};

export const updateLokos = (id, payload) => apiClient.patch(`/clf-resources/lokos/${id}`, payload);

export const deleteLokos = (id) => apiClient.delete(`/clf-resources/lokos/${id}`);

/* ─── VO ─── */
export const listVos = (params) => apiClient.get('/clf-resources/vos', { params });

export const getVo = (id) => apiClient.get(`/clf-resources/vos/${id}`);

export const createVo = (payload) => {
  //  Payload me clfId add karo
  const user = getAuthUser() || {};
  const finalPayload = {
    ...payload,
    clfId: payload.clfId || user.clfId,
  };
  return apiClient.post('/clf-resources/vos', finalPayload);
};

export const updateVo = (id, payload) => apiClient.patch(`/clf-resources/vos/${id}`, payload);

export const deleteVo = (id) => apiClient.delete(`/clf-resources/vos/${id}`);