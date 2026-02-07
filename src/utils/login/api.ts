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
  credentials: LoginCredentials
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
      response.headers["set-cookie"]
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

    // After successful login, fetch complete user data from /api/users/me
    try {
      const userResponse = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS.ME}`,
        {
          credentials: "include",
        }
      );

      if (userResponse.ok) {
        const completeUserData = await userResponse.json();
        console.log("👤 Complete user data fetched:", completeUserData);

        // Store complete user data in Zustand store
        const { setUser } = await import("../../store/user-store");
        const storeUser = {
          id: completeUserData.id || responseData.user?.id || "",
          email: completeUserData.email || responseData.user?.email || "",
          username:
            completeUserData.username || responseData.user?.username || "",
          firstName:
            completeUserData.firstName || responseData.user?.firstName || "",
          lastName:
            completeUserData.lastName || responseData.user?.lastName || "",
          title: completeUserData.title || "",
          phone: completeUserData.phone || "",
          employeeCode: completeUserData.employeeCode || "",
          role: completeUserData.role || "user",
        };

        setUser(storeUser);
        console.log(
          "👤 Complete user data stored in Zustand store:",
          storeUser
        );
      }
    } catch (error) {
      console.warn(
        "⚠️ Failed to fetch complete user data, using basic info:",
        error
      );
    }

    // Check user role and return appropriate redirect path
    let userRole: "user" | "admin" = "user"; // default role
    try {
      const roleCheckResponse = await api.get(
        API_CONFIG.ENDPOINTS.AUTH.CHECK_ROLE,
        {
          params: { role: "admin" },
        }
      );

      const roleData = roleCheckResponse.data as { role?: string };
      userRole = (roleData.role as "user" | "admin") || "user";
      console.log("🎭 User role detected:", userRole);
    } catch (roleError) {
      console.warn(
        "⚠️ Role check API failed, using default user role:",
        roleError
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
      }
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
  refreshToken: string
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
      }
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
 * Returns null if user is not authenticated (401/403)
 */
export const getUserProfile = async (token: string) => {
  try {
    // ตรวจสอบว่ามี token หรือไม่ก่อนเรียก API
    if (!token || token.trim() === "") {
      console.log("No token provided, returning null");
      return null;
    }

    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS.ME}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        // User is not authenticated, return null instead of throwing error
        console.log("User not authenticated, returning null");
        return null;
      }
      throw new Error(`Failed to fetch user data: ${response.status}`);
    }

    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error("Get user profile error:", error);
    // Return null for any error (network error, etc.)
    return null;
  }
};

/**
 * Check if username exists using axios
 */
export const checkUsernameExists = async (
  username: string
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
