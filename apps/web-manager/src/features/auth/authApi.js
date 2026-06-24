import apiClient from '../../api/apiClient';

export const authApi = {
  register: (id, password) => {
    return apiClient.post('/auth/register', { id, password });
  },

  login: (id, password) => {
    return apiClient.post('/auth/login', { id, password });
  },

  refresh: (refreshToken) => {
    return apiClient.post('/auth/refresh', { refreshToken });
  },

  logout: (refreshToken) => {
    return apiClient.post('/auth/logout', { refreshToken: refreshToken || undefined });
  },

  getUserInfo: () => {
    return apiClient.get('/user');
  },

  updatePassword: (oldPassword, newPassword) => {
    return apiClient.post('/user/credential', { oldPassword, newPassword });
  },

  updateUserAccount: (data) => {
    return apiClient.post('/user/account', data);
  },
};
