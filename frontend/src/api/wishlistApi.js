import axiosClient from './axiosClient';

export const getWishlistApi = async () => {
  const response = await axiosClient.get('/wishlist');
  return response.data;
};

export const getWishlistIdsApi = async () => {
  const response = await axiosClient.get('/wishlist/ids');
  return response.data;
};

export const addToWishlistApi = async (productId) => {
  const response = await axiosClient.post(`/wishlist/${productId}`);
  return response.data;
};

export const removeFromWishlistApi = async (productId) => {
  const response = await axiosClient.delete(`/wishlist/${productId}`);
  return response.data;
};
