import axiosClient from "./axiosClient";

export const getFarmerDashboardApi = async () => {
  const response = await axiosClient.get("/dashboard/farmer");
  return response.data;
};

export const getFarmerAnalyticsApi = async (params = {}) => {
  const response = await axiosClient.get("/dashboard/farmer/analytics", { params });
  return response.data;
};

export const getConsumerDashboardApi = async () => {
  const response = await axiosClient.get("/dashboard/consumer");
  return response.data;
};

export const getAdminDashboardApi = async () => {
  const response = await axiosClient.get("/dashboard/admin");
  return response.data;
};
