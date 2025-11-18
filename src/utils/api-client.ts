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
    withCredentials: true,
  });

  // Request interceptor
  instance.interceptors.request.use(
    (config) => {
      // Authentication is handled automatically by browser via HttpOnly cookies
      // The access_token cookie will be sent automatically to same-origin requests

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
        // Unauthorized - redirect to login and clear user data
        // Backend will handle cookie clearing on logout
        if (typeof window !== "undefined") {
          // Clear user data from store on unauthorized
          import("../store/user-store").then(({ clearUserData }) => {
            clearUserData();
          });
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
