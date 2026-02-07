// src/utils/config.ts

/**
 * Environment Configuration Utility
 * Centralized configuration for environment variables with fallbacks
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  ENDPOINTS: {
    AUTH: {
      LOGIN: "/api/auth/login",
      REGISTER: "/api/auth/register",
      VALIDATE: "/api/auth/validate",
      REFRESH: "/api/auth/refresh",
      LOGOUT: "/api/auth/logout",
      PROFILE: "/api/auth/profile",
      CHECK_USERNAME: "/api/auth/check-username",
      CHECK_EMAIL: "/api/auth/check-email",
      CHECK_EMPLOYEE_CODE: "/api/auth/check-employee-code",
      CHECK_ROLE: "/api/auth/check-role",
    },
    COUNTING: {
      SESSIONS: "/api/counting-sessions",
      SESSIONS_BY_TYPE: "/api/counting-sessions/type",
      SESSIONS_BY_USER: "/api/counting-sessions/user",
      SESSIONS_BY_VEHICLE: "/api/counting-sessions/vehicle",
    },
    USERS: {
      ME: "/api/users/me",
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
