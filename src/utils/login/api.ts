// src/utils/login/api.ts

import { LoginCredentials, LoginResponse } from "../types";
import { api } from "../api-client";
import { API_CONFIG } from "../config";
import { storeUserData } from "../../store/user-store";

const LOGIN_ENDPOINT = API_CONFIG.ENDPOINTS.AUTH.LOGIN;

/**
 * Real login API call using axios
 */
export const login = async (
  credentials: LoginCredentials,
): Promise<LoginResponse> => {
  try {
    console.log("🔐 Login API call:", {
      endpoint: LOGIN_ENDPOINT,
      username: credentials.username,
      baseURL: API_CONFIG.BASE_URL,
    });

    const response = await api.post(LOGIN_ENDPOINT, {
      username: credentials.username,
      password: credentials.password,
    });

    console.log("✅ Login response:", {
      status: response.status,
      headers: response.headers,
      data: response.data,
    });

    // Backend sets access_token as HttpOnly cookie, so we don't need to store it
    // The cookie will be automatically sent with subsequent requests
    console.log(
      "🍪 Checking for Set-Cookie header:",
      response.headers["set-cookie"],
    );

    // Store user data in Zustand store
    const responseData = response.data as {
      user?: {
        id: string;
        username: string;
        email: string;
        firstName: string;
        lastName: string;
      };
    };
    if (responseData.user) {
      storeUserData(responseData.user);
      console.log("👤 User data stored in Zustand store:", responseData.user);
    }

    // Check user role and return appropriate redirect path
    let userRole: "user" | "admin" = "user"; // default role
    try {
      const roleCheckResponse = await api.get(
        API_CONFIG.ENDPOINTS.AUTH.CHECK_ROLE,
        {
          params: { role: "admin" },
        },
      );

      const roleData = roleCheckResponse.data as { role?: string };
      userRole = (roleData.role as "user" | "admin") || "user";
      console.log("🎭 User role detected:", userRole);
    } catch (roleError) {
      console.warn(
        "⚠️ Role check API failed, using default user role:",
        roleError,
      );
      // Continue with default user role if role check fails
    }

    return {
      success: true,
      token: "", // Token is managed by HttpOnly cookie, not stored in frontend
      message: "Login successful",
      role: userRole,
    };
  } catch (error: unknown) {
    console.error("❌ Login API error:", error);

    // Log detailed error information
    if (typeof error === "object" && error !== null && "response" in error) {
      const axiosError = error as {
        response?: {
          status?: number;
          statusText?: string;
          headers?: Record<string, unknown>;
          data?: Record<string, unknown>;
        };
        config?: {
          url?: string;
          baseURL?: string;
          withCredentials?: boolean;
        };
      };
      console.error("🔍 Axios error details:", {
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        headers: axiosError.response?.headers,
        data: axiosError.response?.data,
        config: {
          url: axiosError.config?.url,
          baseURL: axiosError.config?.baseURL,
          withCredentials: axiosError.config?.withCredentials,
        },
      });
    }

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
      const errorData = error.response.data as { message: string };
      return {
        success: false,
        message: errorData.message || "Login failed",
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
    };

    return {
      success: true,
      token: data.token,
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
    // Clear user data from store on logout
    const { clearUserData } = await import("../../store/user-store");
    clearUserData();
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
