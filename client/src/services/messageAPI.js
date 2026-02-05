import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const messageAPI = {
  // Get all messages with pagination and filters
  getMessages: async (params = {}) => {
    const response = await axios.get(`${API_BASE_URL}/messages`, { params });
    return response.data;
  },

  // Get single message by ID
  getMessage: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/messages/${id}`);
    return response.data;
  },

  // Create new message (from website)
  createMessage: async (messageData) => {
    const response = await axios.post(`${API_BASE_URL}/messages`, messageData);
    return response.data;
  },

  // Update message
  updateMessage: async (id, messageData) => {
    const response = await axios.put(`${API_BASE_URL}/messages/${id}`, messageData);
    return response.data;
  },

  // Delete message
  deleteMessage: async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/messages/${id}`);
    return response.data;
  },

  // Bulk operations
  bulkOperation: async (action, messageIds, data = {}) => {
    const response = await axios.post(`${API_BASE_URL}/messages/bulk`, {
      action,
      messageIds,
      data
    });
    return response.data;
  },

  // Export messages
  exportMessages: async (params = {}) => {
    const response = await axios.get(`${API_BASE_URL}/messages/export`, { 
      params,
      responseType: params.format === 'csv' ? 'blob' : 'json'
    });
    
    if (params.format === 'csv') {
      // Create download link for CSV
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `messages_export_${new Date().toISOString().split('T')[0]}.csv`);
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
    const response = await axios.get(`${API_BASE_URL}/messages/stats`);
    return response.data;
  }
};

export default messageAPI;
