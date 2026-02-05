import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const newsletterAPI = {
  // Get all newsletters with pagination and filters
  getNewsletters: async (params = {}) => {
    const response = await axios.get(`${API_BASE_URL}/newsletter`, { params });
    return response.data;
  },

  // Get single newsletter by ID
  getNewsletter: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/newsletter/${id}`);
    return response.data;
  },

  // Add new newsletter subscription
  createNewsletter: async (newsletterData) => {
    const response = await axios.post(`${API_BASE_URL}/newsletter`, newsletterData);
    return response.data;
  },

  // Update newsletter subscription
  updateNewsletter: async (id, newsletterData) => {
    const response = await axios.put(`${API_BASE_URL}/newsletter/${id}`, newsletterData);
    return response.data;
  },

  // Delete newsletter subscription
  deleteNewsletter: async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/newsletter/${id}`);
    return response.data;
  },

  // Bulk operations
  bulkOperation: async (action, emails, data = {}) => {
    const response = await axios.post(`${API_BASE_URL}/newsletter/bulk`, {
      action,
      emails,
      data
    });
    return response.data;
  },

  // Export newsletters
  exportNewsletters: async (params = {}) => {
    const response = await axios.get(`${API_BASE_URL}/newsletter/export`, { 
      params,
      responseType: params.format === 'csv' ? 'blob' : 'json'
    });
    
    if (params.format === 'csv') {
      // Create download link for CSV
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `newsletter_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      return { success: true };
    }
    
    return response.data;
  },

  // Get statistics
  getStats: async () => {
    const response = await axios.get(`${API_BASE_URL}/newsletter/stats`);
    return response.data;
  }
};

export default newsletterAPI;
