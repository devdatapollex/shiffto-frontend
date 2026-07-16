import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { env } from '@/config/env.config';
import { logger } from './logger';

const apiClient: AxiosInstance = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    logger.debug(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    logger.error('Request Interceptor Error', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    const status = error.response?.status;
    const responseData = error.response?.data as { message?: string } | undefined;
    const message = responseData?.message || error.message || 'Something went wrong';

    logger.error(`API Error [${status || 'NETWORK'}]: ${message}`, {
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data,
    });

    if (status === 401) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    if (status === 403) {
      logger.warn('User does not have permission for this action');
    }

    return Promise.reject({
      message,
      status,
      data: error.response?.data,
      originalError: error,
    });
  }
);

export default apiClient;
