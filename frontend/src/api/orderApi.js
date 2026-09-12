import axiosClient from './axiosClient';

export const createOrderApi = async (orderData) => {
  const response = await axiosClient.post('/orders', orderData);
  return response.data;
};

export const getMyOrdersApi = async () => {
  const response = await axiosClient.get('/orders/my-orders');
  return response.data;
};

export const getFarmerOrdersApi = async () => {
  const response = await axiosClient.get('/orders/farmer-orders');
  return response.data;
};

export const getAllOrdersApi = async () => {
  const response = await axiosClient.get('/orders/admin');
  return response.data;
};

export const getOrderByIdApi = async (id) => {
  const response = await axiosClient.get(`/orders/${id}`);
  return response.data;
};

export const updateOrderStatusApi = async (id, statusData) => {
  const response = await axiosClient.patch(`/orders/${id}/status`, statusData);
  return response.data;
};

export const cancelOrderApi = async (id, cancelData) => {
  const response = await axiosClient.patch(`/orders/${id}/cancel`, cancelData);
  return response.data;
};
