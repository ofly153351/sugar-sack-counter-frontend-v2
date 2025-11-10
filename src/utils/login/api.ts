// src/utils/login/api.ts

import { LoginCredentials, LoginResponse, UserRole } from "../types";
import { api } from "../api-client";
import { API_CONFIG } from "../config";

const LOGIN_ENDPOINT = API_CONFIG.ENDPOINTS.AUTH.LOGIN;

/**
 * Real login API call using axios
 */
export const login = async (
  credentials: LoginCredentials,
): Promise<LoginResponse> => {
  try {
    const response = await api.post(LOGIN_ENDPOINT, {
      username: credentials.username,
      password: credentials.password,
    });

    const data = response.data as {
      token: string;
      role: string;
      message?: string;
    };

    return {
      success: true,
      token: data.token,
      role: data.role as UserRole,
      message: data.message || "Login successful",
    };
  } catch (error: unknown) {
    console.error("Login API error:", error);

    // Handle axios error response
    if (
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      typeof error.response === "object" &&
      error.response !== null &&
      "data" in error.response &&
      typeof error.response.data === "object" &&
      error.response.data !== null &&
      "message" in error.response.data
    ) {
      return {
        success: false,
        message:
          (error.response.data as { message: string }).message ||
          "Login failed",
      };
    }

    return {
      success: false,
      message: "Network error. Please try again.",
    };
  }
};

/**
 * Validate token with backend using axios
 */
export const validateToken = async (token: string): Promise<boolean> => {
  try {
    await api.post(
      API_CONFIG.ENDPOINTS.AUTH.VALIDATE,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return true;
  } catch (error) {
    console.error("Token validation error:", error);
    return false;
  }
};

/**
 * Refresh authentication token using axios
 */
export const refreshToken = async (
  refreshToken: string,
): Promise<LoginResponse> => {
  try {
    const response = await api.post(API_CONFIG.ENDPOINTS.AUTH.REFRESH, {
      refreshToken,
    });

    const data = response.data as {
      token: string;
      role: string;
    };

    return {
      success: true,
      token: data.token,
      role: data.role as UserRole,
      message: "Token refreshed successfully",
    };
  } catch (error: unknown) {
    console.error("Token refresh error:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      typeof error.response === "object" &&
      error.response !== null &&
      "data" in error.response &&
      typeof error.response.data === "object" &&
      error.response.data !== null &&
      "message" in error.response.data
    ) {
      return {
        success: false,
        message:
          (error.response.data as { message: string }).message ||
          "Token refresh failed",
      };
    }

    return {
      success: false,
      message: "Network error during token refresh",
    };
  }
};

/**
 * Logout user from backend using axios
 */
export const logout = async (token: string): Promise<boolean> => {
  try {
    await api.post(
      API_CONFIG.ENDPOINTS.AUTH.LOGOUT,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return true;
  } catch (error) {
    console.error("Logout API error:", error);
    return false;
  }
};

/**
 * Get user profile from backend using axios
 */
export const getUserProfile = async (token: string) => {
  try {
    const response = await api.get(API_CONFIG.ENDPOINTS.AUTH.PROFILE, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Get user profile error:", error);
    throw error;
  }
};

/**
 * Check if username exists using axios
 */
export const checkUsernameExists = async (
  username: string,
): Promise<boolean> => {
  try {
    const response = await api.post(API_CONFIG.ENDPOINTS.AUTH.CHECK_USERNAME, {
      username,
    });
    const data = response.data as { exists?: boolean };
    return data.exists || false;
  } catch (error) {
    console.error("Check username error:", error);
    return false;
  }
};
