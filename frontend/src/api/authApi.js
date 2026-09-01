import axiosClient from './axiosClient';

export const registerApi = async (userData) => {
  const response = await axiosClient.post('/auth/register', userData);
  return response.data;
};

export const loginApi = async (credentials) => {
  const response = await axiosClient.post('/auth/login', credentials);
  return response.data;
};

export const googleAuthApi = async (data) => {
  const response = await axiosClient.post('/auth/google', data);
  return response.data;
};

export const forgotPasswordApi = async (emailData) => {
  const response = await axiosClient.post('/auth/forgot-password', emailData);
  return response.data;
};

export const resetPasswordApi = async (resetToken, passwordData) => {
  const response = await axiosClient.post(`/auth/reset-password/${resetToken}`, passwordData);
  return response.data;
};

export const getMeApi = async () => {
  const response = await axiosClient.get('/auth/me');
  return response.data;
};
