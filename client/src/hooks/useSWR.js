import useSWR, { useSWRConfig } from 'swr';
import { blogAPI, categoryAPI, tagAPI, projectAPI, serviceAPI } from '../services/api';

// Generic fetcher function
const fetcher = async (url) => {
  const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const fullUrl = url.startsWith('/api') ? `${baseURL}${url.substring(4)}` : `${baseURL}${url}`;
  
  const response = await fetch(fullUrl, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  
  return response.json();
};

// Custom hook for blogs with pagination and filters
export const useBlogs = (filters = {}) => {
  const { page = 1, limit = 10, status, category } = filters;
  
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(status && { status }),
    ...(category && { category }),
  });

  const { data, error, isLoading, mutate } = useSWR(
    `/blogposts?${queryParams}`,
    fetcher
  );

  return {
    blogs: data?.data?.blogs || [],
    pagination: data?.data?.pagination || { page: 1, limit: 10, total: 0, pages: 0 },
    isLoading,
    error,
    mutate
  };
};

// Custom hook for categories
export const useCategories = () => {
  const { data, error, isLoading, mutate } = useSWR(
    '/categories',
    fetcher
  );

  return {
    categories: data?.data?.categories || [],
    isLoading,
    error,
    mutate
  };
};

// Custom hook for tags
export const useTags = () => {
  const { data, error, isLoading, mutate } = useSWR(
    '/tags',
    fetcher
  );

  return {
    tags: data?.data?.tags || [],
    isLoading,
    error,
    mutate
  };
};

// Custom hook for active services (for project selection)
export const useActiveServices = () => {
  const { data, error, isLoading, mutate } = useSWR(
    '/services/active',
    fetcher
  );

  return {
    services: data?.data?.services || [],
    isLoading,
    error,
    mutate
  };
};

// Custom hook for services with pagination
export const useServices = (filters = {}) => {
  const { page = 1, limit = 10 } = filters;
  
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString()
  });

  const { data, error, isLoading, mutate } = useSWR(
    `/services?${queryParams}`,
    fetcher
  );

  return {
    services: data?.data?.services || [],
    pagination: data?.data?.pagination || { page: 1, limit: 10, total: 0, pages: 0 },
    isLoading,
    error,
    mutate
  };
};

// Custom hook for projects with pagination
export const useProjects = (filters = {}) => {
  const { page = 1, limit = 10 } = filters;
  
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString()
  });

  const { data, error, isLoading, mutate } = useSWR(
    `/projects?${queryParams}`,
    fetcher
  );

  return {
    projects: data?.data?.projects || [],
    pagination: data?.data?.pagination || { page: 1, limit: 10, total: 0, pages: 0 },
    isLoading,
    error,
    mutate
  };
};

// Hook for global mutate function
export const useGlobalMutate = () => {
  const { mutate } = useSWRConfig();
  return mutate;
};
