import axiosClient from './axiosClient';

/**
 * Send a message to the secure FarmEasy AI backend
 * @param {string} message - User query text
 * @param {Array} history - Previous conversation turns [{ role, content }]
 * @returns {Promise<{ success: boolean, answer: string, sources: Array, role: string }>}
 */
export const chatWithAIApi = async (message, history = []) => {
  const response = await axiosClient.post('/ai/chat', {
    message,
    history,
  });
  return response.data;
};

/**
 * Check the status of the AI service through Express backend
 * @returns {Promise<{ success: boolean, status: string, data: object }>}
 */
export const getAIHealthApi = async () => {
  const response = await axiosClient.get('/ai/health');
  return response.data;
};

export default {
  chatWithAIApi,
  getAIHealthApi,
};
