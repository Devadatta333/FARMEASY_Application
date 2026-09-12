import axiosClient from './axiosClient';

export const updateProfileApi = async (formDataOrData) => {
  const isFormData = formDataOrData instanceof FormData;
  const config = isFormData
    ? { headers: { 'Content-Type': 'multipart/form-data' } }
    : {};
  const response = await axiosClient.put('/users/profile', formDataOrData, config);
  return response.data;
};

export const changePasswordApi = async (data) => {
  const response = await axiosClient.put('/users/change-password', data);
  return response.data;
};

export const updatePreferencesApi = async (data) => {
  const response = await axiosClient.put('/users/preferences', data);
  return response.data;
};

export const deleteAccountApi = async (data) => {
  const response = await axiosClient.delete('/users/account', { data });
  return response.data;
};
