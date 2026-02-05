import { useState, useEffect } from 'react';
import { messageAPI } from '../services/api';

// Custom hook for messages with pagination
export const useMessages = (filters = {}) => {
  const [messages, setMessages] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMessages = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await messageAPI.getMessages(filters);
      if (response.success) {
        setMessages(response.data.messages);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch messages');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [filters.page, filters.limit, filters.status, filters.priority, filters.source, filters.search]);

  return {
    messages,
    pagination,
    isLoading,
    error,
    refetch: fetchMessages
  };
};

// Custom hook for message statistics
export const useMessageStats = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await messageAPI.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch message statistics');
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

// Custom hook for single message
export const useMessage = (id) => {
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMessage = async () => {
    if (!id) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await messageAPI.getMessage(id);
      if (response.success) {
        setMessage(response.data.message);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch message');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessage();
  }, [id]);

  return {
    message,
    isLoading,
    error,
    refetch: fetchMessage
  };
};
