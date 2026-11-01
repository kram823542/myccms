export const getAuthUser = () => {
  try {
    const raw = sessionStorage.getItem('user');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const setAuthUser = (user) => {
  if (!user) return;
  sessionStorage.setItem('user', JSON.stringify(user));
};

export const clearAuthState = () => {
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('refreshToken');
  sessionStorage.removeItem('user');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

export const getAuthToken = () => sessionStorage.getItem('accessToken');

export const setAuthToken = (token) => {
  if (!token) return;
  sessionStorage.setItem('accessToken', token);
};

export const setRefreshToken = (token) => {
  if (!token) return;
  sessionStorage.setItem('refreshToken', token);
};
