// src/utils/login/auth.ts

import { LoginCredentials, UserRole, AuthTokens } from "../types";

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
 * Store authentication token (no-op since backend handles via HttpOnly cookie)
 */
export const storeAuthToken = (): void => {
  // Backend sets access_token as HttpOnly cookie automatically
  // No need to store token manually in frontend
};

/**
 * Get authentication token (not available in frontend due to HttpOnly cookie)
 */
export const getAuthToken = (): string | null => {
  // Token is stored as HttpOnly cookie by backend
  // Cannot be accessed via JavaScript for security
  return null;
};

/**
 * Get user role (not used - for compatibility only)
 */
export const getUserRole = (): UserRole | null => {
  return null;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return getAuthToken() !== null;
};

/**
 * Check if user has admin role (not used - for compatibility only)
 */
export const isAdmin = (): boolean => {
  return false;
};

/**
 * Clear authentication token (no-op since backend handles logout)
 */
export const clearAuthToken = (): void => {
  // Backend handles logout and cookie clearing
  // Frontend doesn't need to manage HttpOnly cookies
};

/**
 * Get redirect URL from query parameters
 */
export const getRedirectUrl = (defaultUrl: string = "/admin"): string => {
  if (typeof window !== "undefined") {
    const urlParams = new URLSearchParams(window.location.search);
    const redirectPath = urlParams.get("from") || defaultUrl;

    // Get current locale from URL path
    const pathSegments = window.location.pathname.split("/").filter(Boolean);
    const currentLocale =
      pathSegments[0] === "en" || pathSegments[0] === "th"
        ? pathSegments[0]
        : "th";

    // Ensure redirect path includes locale prefix
    if (!redirectPath.startsWith(`/${currentLocale}`)) {
      return `/${currentLocale}${redirectPath}`;
    }

    return redirectPath;
  }
  return defaultUrl;
};

/**
 * Get current authentication state
 */
export const getAuthState = (): AuthTokens | null => {
  // Authentication state is managed by backend via HttpOnly cookie
  // Frontend cannot directly access the token
  return null;
};
