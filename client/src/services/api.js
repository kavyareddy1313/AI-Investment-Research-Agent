import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const analyzeCompany = async (companyName) => {
  const response = await apiClient.post('/analyze', { companyName });
  if (!response.data.success) {
    throw new Error(response.data.error || 'Failed to analyze company');
  }
  return response.data.data;
};

export const getHistory = async (page = 1, limit = 20) => {
  const response = await apiClient.get('/history', {
    params: { page, limit }
  });
  if (!response.data.success) {
    throw new Error(response.data.error || 'Failed to fetch history');
  }
  return response.data.data.reports;
};

export const getReportById = async (id) => {
  const response = await apiClient.get(`/history/${id}`);
  if (!response.data.success) {
    throw new Error(response.data.error || 'Failed to fetch report');
  }
  return response.data.data;
};

export const deleteReport = async (id) => {
  const response = await apiClient.delete(`/history/${id}`);
  if (!response.data.success) {
    throw new Error(response.data.error || 'Failed to delete report');
  }
};
