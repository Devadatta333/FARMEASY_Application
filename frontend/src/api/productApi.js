import axiosClient from "./axiosClient";

export const createProductApi = async (formData) => {
  const response = await axiosClient.post("/products", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getFarmerProductsApi = async () => {
  const response = await axiosClient.get("/products/farmer/my-products");
  return response.data;
};

export const getAllProductsApi = async (params = {}) => {
  const response = await axiosClient.get("/products", { params });
  return response.data;
};

export const getProductByIdApi = async (id) => {
  const response = await axiosClient.get(`/products/${id}`);
  return response.data;
};

export const updateProductApi = async (id, formData) => {
  const response = await axiosClient.put(`/products/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const deleteProductApi = async (id) => {
  const response = await axiosClient.delete(`/products/${id}`);
  return response.data;
};

export const updateStockQuantityApi = async (id, quantity) => {
  const response = await axiosClient.patch(`/products/${id}/stock`, { quantity });
  return response.data;
};
