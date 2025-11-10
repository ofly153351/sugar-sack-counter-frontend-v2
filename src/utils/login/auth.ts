// src/utils/login/auth.ts

import {
  LoginCredentials,
  LoginResponse,
  UserRole,
  AuthTokens,
} from "../types";
import { AUTH_CONFIG } from "../config";

// Authentication constants
export const AUTH_TOKEN_KEY = AUTH_CONFIG.TOKEN_KEY;
export const USER_ROLE_KEY = AUTH_CONFIG.ROLE_KEY;
export const COOKIE_AUTH_TOKEN = AUTH_CONFIG.COOKIE_TOKEN;

// Authentication regex patterns
export const AUTH_REGEX = /^[A-Za-z0-9]{6,}$/;

/**
 * Validate username format
 */
export const validateUsername = (username: string): boolean => {
  return AUTH_REGEX.test(username);
};

/**
 * Validate password format
 */
export const validatePassword = (password: string): boolean => {
  return AUTH_REGEX.test(password);
};

/**
 * Validate login credentials
 */
export const validateLoginCredentials = (
  credentials: LoginCredentials,
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!validateUsername(credentials.username)) {
    errors.push(
      "Username must be at least 6 characters and contain only English letters or numbers",
    );
  }

  if (!validatePassword(credentials.password)) {
    errors.push(
      "Password must be at least 6 characters and contain only English letters or numbers",
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Store authentication tokens
 */
export const storeAuthTokens = (
  token: string,
  role: UserRole = "user",
): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(USER_ROLE_KEY, role);

    // Set cookie with 1 day expiration
    const expires = new Date();
    expires.setDate(expires.getDate() + 1);
    document.cookie = `${COOKIE_AUTH_TOKEN}=${token}; path=/; expires=${expires.toUTCString()}; SameSite=Strict`;
  }
};

/**
 * Get authentication token
 */
export const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }
  return null;
};

/**
 * Get user role
 */
export const getUserRole = (): UserRole | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(USER_ROLE_KEY) as UserRole | null;
  }
  return null;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return getAuthToken() !== null;
};

/**
 * Check if user has admin role
 */
export const isAdmin = (): boolean => {
  return getUserRole() === "admin";
};

/**
 * Clear authentication tokens
 */
export const clearAuthTokens = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_ROLE_KEY);

    // Clear cookie
    document.cookie = `${COOKIE_AUTH_TOKEN}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict`;
  }
};

/**
 * Get redirect URL from query parameters
 */
export const getRedirectUrl = (defaultUrl: string = "/admin"): string => {
  if (typeof window !== "undefined") {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("from") || defaultUrl;
  }
  return defaultUrl;
};

/**
 * Get current authentication state
 */
export const getAuthState = (): AuthTokens | null => {
  const token = getAuthToken();
  const role = getUserRole();

  if (token && role) {
    return {
      token,
      role,
    };
  }

  return null;
};
