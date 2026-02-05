import { useState, useEffect } from 'react';
import { newsletterAPI } from '../services/api';

// Custom hook for newsletters with pagination
export const useNewsletters = (filters = {}) => {
  const [newsletters, setNewsletters] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNewsletters = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await newsletterAPI.getNewsletters(filters);
      if (response.success) {
        setNewsletters(response.data.newsletters);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch newsletters');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNewsletters();
  }, [filters.page, filters.limit, filters.status, filters.source, filters.search]);

  return {
    newsletters,
    pagination,
    isLoading,
    error,
    refetch: fetchNewsletters
  };
};

// Custom hook for newsletter statistics
export const useNewsletterStats = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await newsletterAPI.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch newsletter statistics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats
  };
};

// Custom hook for single newsletter
export const useNewsletter = (id) => {
  const [newsletter, setNewsletter] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNewsletter = async () => {
    if (!id) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await newsletterAPI.getNewsletter(id);
      if (response.success) {
        setNewsletter(response.data.newsletter);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch newsletter');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNewsletter();
  }, [id]);

  return {
    newsletter,
    isLoading,
    error,
    refetch: fetchNewsletter
  };
};
