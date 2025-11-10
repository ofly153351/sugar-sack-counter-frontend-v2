// src/utils/api-client.ts

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { API_CONFIG } from "./config";

/**
 * Create axios instance with base configuration
 */
const createApiClient = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request interceptor
  instance.interceptors.request.use(
    (config) => {
      // Add auth token if available
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("authToken");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }

      // Log request in development
      if (process.env.NEXT_PUBLIC_DEBUG === "true") {
        console.log(
          `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`,
          config.data,
        );
      }

      return config;
    },
    (error) => {
      console.error("API Request Error:", error);
      return Promise.reject(error);
    },
  );

  // Response interceptor
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      // Log response in development
      if (process.env.NEXT_PUBLIC_DEBUG === "true") {
        console.log(
          `✅ API Response: ${response.status} ${response.config.url}`,
          response.data,
        );
      }
      return response;
    },
    (error) => {
      // Log error in development
      if (process.env.NEXT_PUBLIC_DEBUG === "true") {
        console.error(
          `❌ API Error: ${error.response?.status} ${error.config?.url}`,
          error.response?.data,
        );
      }

      // Handle common error cases
      if (error.response?.status === 401) {
        // Unauthorized - clear token and redirect to login
        if (typeof window !== "undefined") {
          localStorage.removeItem("authToken");
          localStorage.removeItem("userRole");
          window.location.href = "/login";
        }
      }

      return Promise.reject(error);
    },
  );

  return instance;
};

// Export the axios instance
export const apiClient = createApiClient();

// Export common HTTP methods with proper typing
export const api = {
  get: <T = unknown>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> => apiClient.get(url, config),

  post: <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> => apiClient.post(url, data, config),

  put: <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> => apiClient.put(url, data, config),

  patch: <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> => apiClient.patch(url, data, config),

  delete: <T = unknown>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> => apiClient.delete(url, config),
};

// Export the instance for custom configurations
export default apiClient;
