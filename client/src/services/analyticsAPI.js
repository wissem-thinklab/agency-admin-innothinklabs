import api from './api';

const analyticsAPI = {
  // Get comprehensive analytics overview
  getOverview: async (timeRange = '30d') => {
    const response = await api.get(`/analytics/overview?timeRange=${timeRange}`);
    return response.data;
  },

  // Get campaign analytics
  getCampaigns: async () => {
    const response = await api.get('/analytics/campaigns');
    return response.data;
  },

  // Get user activity analytics
  getActivity: async (timeRange = '30d') => {
    const response = await api.get(`/analytics/activity?timeRange=${timeRange}`);
    return response.data;
  },

  // Get newsletter statistics (existing endpoint)
  getNewsletterStats: async () => {
    const response = await api.get('/newsletter/stats');
    return response.data;
  },

  // Get message statistics (existing endpoint)
  getMessageStats: async () => {
    const response = await api.get('/messages/stats');
    return response.data;
  },

  // Export analytics data
  exportData: async (type, format = 'csv', timeRange = '30d') => {
    const response = await api.get(`/analytics/export?type=${type}&format=${format}&timeRange=${timeRange}`);
    return response.data;
  }
};

export default analyticsAPI;
