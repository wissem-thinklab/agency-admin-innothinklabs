import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Utility function to build image URLs
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Images are now stored in the public folder, so no server URL needed
  return `/images/blog-covers/${imagePath}`;
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Don't redirect here - let the auth context handle it
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

// Admin API calls
export const adminAPI = {
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },
};

// Blog API calls
export const blogAPI = {
  getBlogs: async (params = {}) => {
    const response = await api.get('/blogposts', { params });
    return response.data;
  },
  
  getBlog: async (id) => {
    const response = await api.get(`/blogposts/${id}`);
    return response.data;
  },
  
  createBlog: async (blogData) => {
    const response = await api.post('/blogposts', blogData);
    return response.data;
  },
  
  updateBlog: async (id, blogData) => {
    const response = await api.put(`/blogposts/${id}`, blogData);
    return response.data;
  },
  
  deleteBlog: async (id) => {
    const response = await api.delete(`/blogposts/${id}`);
    return response.data;
  },
  
  togglePublish: async (id) => {
    const response = await api.patch(`/blogposts/${id}/toggle-publish`);
    return response.data;
  },
  
  getBlogStats: async () => {
    const response = await api.get('/blogposts/stats/overview');
    return response.data;
  },
};

// Category API calls
export const categoryAPI = {
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },
  
  getCategory: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },
  
  createCategory: async (categoryData) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },
  
  updateCategory: async (id, categoryData) => {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },
  
  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

// Tag API calls
export const tagAPI = {
  getTags: async () => {
    const response = await api.get('/tags');
    return response.data;
  },
  
  getTag: async (id) => {
    const response = await api.get(`/tags/${id}`);
    return response.data;
  },
  
  createTag: async (tagData) => {
    const response = await api.post('/tags', tagData);
    return response.data;
  },
  
  updateTag: async (id, tagData) => {
    const response = await api.put(`/tags/${id}`, tagData);
    return response.data;
  },
  
  deleteTag: async (id) => {
    const response = await api.delete(`/tags/${id}`);
    return response.data;
  },
};

// Service API calls
export const serviceAPI = {
  getServices: async () => {
    const response = await api.get('/services');
    return response.data;
  },
  
  getService: async (id) => {
    const response = await api.get(`/services/${id}`);
    return response.data;
  },
  
  createService: async (serviceData) => {
    const response = await api.post('/services', serviceData);
    return response.data;
  },
  
  updateService: async (id, serviceData) => {
    const response = await api.put(`/services/${id}`, serviceData);
    return response.data;
  },
  
  deleteService: async (id) => {
    const response = await api.delete(`/services/${id}`);
    return response.data;
  },
};

// Project API calls
export const projectAPI = {
  getProjects: async (params = {}) => {
    const response = await api.get('/projects', { params });
    return response.data;
  },
  
  getProject: async (id) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },
  
  createProject: async (projectData) => {
    const response = await api.post('/projects', projectData);
    return response.data;
  },
  
  updateProject: async (id, projectData) => {
    const response = await api.put(`/projects/${id}`, projectData);
    return response.data;
  },
  
  deleteProject: async (id) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },
  
  toggleFeatured: async (id) => {
    const response = await api.patch(`/projects/${id}/featured`);
    return response.data;
  },
  
  getProjectStats: async () => {
    const response = await api.get('/projects/stats/overview');
    return response.data;
  },
};

// Upload API calls
export const uploadAPI = {
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  deleteImage: async (filename) => {
    const response = await api.delete(`/upload/image/${filename}`);
    return response.data;
  },
};

// Newsletter API calls
export const newsletterAPI = {
  getNewsletters: async (params = {}) => {
    const response = await api.get('/newsletter', { params });
    return response.data;
  },

  getNewsletter: async (id) => {
    const response = await api.get(`/newsletter/${id}`);
    return response.data;
  },

  createNewsletter: async (newsletterData) => {
    const response = await api.post('/newsletter', newsletterData);
    return response.data;
  },

  updateNewsletter: async (id, newsletterData) => {
    const response = await api.put(`/newsletter/${id}`, newsletterData);
    return response.data;
  },

  deleteNewsletter: async (id) => {
    const response = await api.delete(`/newsletter/${id}`);
    return response.data;
  },

  bulkOperation: async (action, emails, data = {}) => {
    const response = await api.post('/newsletter/bulk', {
      action,
      emails,
      data
    });
    return response.data;
  },

  exportNewsletters: async (params = {}) => {
    const response = await api.get('/newsletter/export', { 
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

  getStats: async () => {
    const response = await api.get('/newsletter/stats');
    return response.data;
  },

  // Send email campaign
  sendCampaign: async (campaignData) => {
    const formData = new FormData();
    
    // Append form fields
    Object.keys(campaignData).forEach(key => {
      if (key !== 'htmlFile' && key !== 'selectedIds') {
        formData.append(key, campaignData[key]);
      }
    });
    
    // Append selected IDs array if it exists
    if (campaignData.selectedIds && Array.isArray(campaignData.selectedIds)) {
      formData.append('selectedIds', JSON.stringify(campaignData.selectedIds));
    }
    
    // Append file if exists
    if (campaignData.htmlFile) {
      formData.append('htmlFile', campaignData.htmlFile);
    }
    
    const response = await api.post('/newsletter/send-campaign', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  }
};

// Message API calls
export const messageAPI = {
  getMessages: async (params = {}) => {
    const response = await api.get('/messages', { params });
    return response.data;
  },

  getMessage: async (id) => {
    const response = await api.get(`/messages/${id}`);
    return response.data;
  },

  createMessage: async (messageData) => {
    const response = await api.post('/messages', messageData);
    return response.data;
  },

  updateMessage: async (id, messageData) => {
    const response = await api.put(`/messages/${id}`, messageData);
    return response.data;
  },

  deleteMessage: async (id) => {
    const response = await api.delete(`/messages/${id}`);
    return response.data;
  },

  bulkOperation: async (action, messageIds, data = {}) => {
    const response = await api.post('/messages/bulk', {
      action,
      messageIds,
      data
    });
    return response.data;
  },

  exportMessages: async (params = {}) => {
    const response = await api.get('/messages/export', { 
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

  getStats: async () => {
    const response = await api.get('/messages/stats');
    return response.data;
  }
};

export default api;
