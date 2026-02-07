// src/utils/config.ts

/**
 * Environment Configuration Utility
 * Centralized configuration for environment variables with fallbacks
 */

// API Configuration
export const API_CONFIG = {
  // Base URL property for backward compatibility
  get BASE_URL() {
    const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    // Remove trailing slash if present
    return url.endsWith("/") ? url.slice(0, -1) : url;
  },
  // Helper function to normalize API URL
  getBaseUrl: () => {
    const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    // Remove trailing slash if present
    return url.endsWith("/") ? url.slice(0, -1) : url;
  },
  // Helper function to build full URL
  buildUrl: (endpoint: string) => {
    const baseUrl = API_CONFIG.getBaseUrl();
    // Check if base URL already ends with /api
    const hasApiSuffix = baseUrl.endsWith("/api");
    // Check if endpoint starts with /api
    const hasApiPrefix = endpoint.startsWith("/api/");

    if (hasApiSuffix && hasApiPrefix) {
      // Remove /api prefix from endpoint since base URL already has it
      return `${baseUrl}${endpoint.substring(4)}`;
    } else if (!hasApiSuffix && !hasApiPrefix && endpoint.startsWith("/")) {
      // Base URL doesn't have /api, endpoint doesn't have /api prefix
      // Add /api prefix for backward compatibility
      return `${baseUrl}/api${endpoint}`;
    } else {
      // Use as-is
      return `${baseUrl}${endpoint}`;
    }
  },
  ENDPOINTS: {
    AUTH: {
      LOGIN: "/auth/login",
      REGISTER: "/auth/register",
      VALIDATE: "/auth/validate",
      REFRESH: "/auth/refresh",
      LOGOUT: "/auth/logout",
      PROFILE: "/auth/profile",
      CHECK_USERNAME: "/auth/check-username",
      CHECK_EMAIL: "/auth/check-email",
      CHECK_EMPLOYEE_CODE: "/auth/check-employee-code",
      CHECK_ROLE: "/auth/check-role",
    },
    COUNTING: {
      SESSIONS: "/counting-sessions",
      SESSIONS_BY_TYPE: "/counting-sessions/type",
      SESSIONS_BY_USER: "/counting-sessions/user",
      SESSIONS_BY_VEHICLE: "/counting-sessions/vehicle",
    },
    USERS: {
      ME: "/users/me",
    },
  },
} as const;

// AI Service Configuration
export const AI_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_AI_SERVICE_URL || "http://localhost:8082",
  ENDPOINTS: {
    DETECT: "/detect",
    DETECT_SACKS: "/detect-sacks",
    DETECT_BOXES: "/detect-boxes",
    HEALTH: "/health",
    SAVE_TO_MINIO: "/save-to-minio",
    MINIO_STATUS: "/minio-status",
  },
  FALLBACK_ENDPOINTS: [
    process.env.NEXT_PUBLIC_AI_SERVICE_URL || "http://localhost:8082",
    "/api/ai",
    "http://127.0.0.1:8082",
  ],
  TIMEOUT: 30000, // 30 seconds
} as const;

// Authentication Configuration
export const AUTH_CONFIG = {
  TOKEN_KEY: process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || "authToken",
  ROLE_KEY: process.env.NEXT_PUBLIC_USER_ROLE_KEY || "userRole",
  COOKIE_TOKEN: process.env.NEXT_PUBLIC_COOKIE_AUTH_TOKEN || "access_token",
  TOKEN_EXPIRY_DAYS: 1, // 1 day
} as const;

// Application Configuration
export const APP_CONFIG = {
  NAME: process.env.NEXT_PUBLIC_APP_NAME || "Sugar Sack Counter",
  VERSION: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
  DEFAULT_LOCALE: process.env.NEXT_PUBLIC_DEFAULT_LOCALE || "th",
} as const;

// Development Configuration
export const DEV_CONFIG = {
  DEBUG: process.env.NEXT_PUBLIC_DEBUG === "true" || false,
  LOG_LEVEL: process.env.NEXT_PUBLIC_LOG_LEVEL || "info",
} as const;

// Validation Patterns
export const VALIDATION_PATTERNS = {
  USERNAME: /^[A-Za-z0-9]{6,}$/,
  PASSWORD: /^[A-Za-z0-9]{6,}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[0-9]{10}$/,
  EMPLOYEE_CODE: /^[A-Za-z0-9]{4,20}$/,
} as const;

// Environment Type Guards
export const isDevelopment = (): boolean =>
  process.env.NODE_ENV === "development";
export const isProduction = (): boolean =>
  process.env.NODE_ENV === "production";
export const isTest = (): boolean => process.env.NODE_ENV === "test";

// Configuration Validation
export const validateConfig = (): void => {
  const requiredEnvVars = ["NEXT_PUBLIC_BACKEND_URL"] as const;

  const missingVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missingVars.length > 0 && isProduction()) {
    console.warn(
      `Missing required environment variables in production: ${missingVars.join(
        ", "
      )}`
    );
  }
};

// Export all configuration as a single object for convenience
export const CONFIG = {
  API: API_CONFIG,
  AI: AI_CONFIG,
  AUTH: AUTH_CONFIG,
  APP: APP_CONFIG,
  DEV: DEV_CONFIG,
  VALIDATION: VALIDATION_PATTERNS,
  ENV: {
    isDevelopment,
    isProduction,
    isTest,
  },
} as const;

// Default export for easy importing
export default CONFIG;
