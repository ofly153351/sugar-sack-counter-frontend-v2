// src/utils/register/api.ts

import { RegisterFormData, RegisterResponse } from "./types";
import { UserRole } from "../types";
import { api } from "../api-client";
import { API_CONFIG, AUTH_CONFIG } from "../config";

// API configuration
const REGISTER_ENDPOINT = API_CONFIG.ENDPOINTS.AUTH.REGISTER;
const AUTH_TOKEN_KEY = AUTH_CONFIG.TOKEN_KEY;
const USER_ROLE_KEY = AUTH_CONFIG.ROLE_KEY;
const COOKIE_AUTH_TOKEN = AUTH_CONFIG.COOKIE_TOKEN;

/**
 * Real registration API call using axios
 */
export const register = async (
  formData: RegisterFormData,
): Promise<RegisterResponse> => {
  try {
    const response = await api.post(REGISTER_ENDPOINT, {
      username: formData.username,
      employee_code: formData.employeecode,
      prefix: formData.prefix,
      first_name: formData.firstName,
      last_name: formData.lastName,
      phone: formData.phone,
      email: formData.email,
      password: formData.password,
    });

    const data = response.data as {
      message?: string;
      token?: string;
      user?: {
        id: string;
        username: string;
        first_name: string;
        last_name: string;
        email: string;
        role: string;
      };
    };

    return {
      success: true,
      message: data.message || "Registration successful",
      token: data.token,
      user: data.user
        ? {
            id: data.user.id,
            username: data.user.username,
            firstName: data.user.first_name,
            lastName: data.user.last_name,
            email: data.user.email,
            role: data.user.role as UserRole,
          }
        : undefined,
    };
  } catch (error: unknown) {
    console.error("Registration API error:", error);

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
          "Registration failed",
      };
    }

    return {
      success: false,
      message: "Network error. Please try again.",
    };
  }
};

/**
 * Check username availability with backend using axios
 */
export const checkUsernameAvailability = async (
  username: string,
): Promise<boolean> => {
  try {
    const response = await api.post(API_CONFIG.ENDPOINTS.AUTH.CHECK_USERNAME, {
      username,
    });
    const data = response.data as { available?: boolean };
    return data.available || false;
  } catch (error) {
    console.error("Check username availability error:", error);
    return false;
  }
};

/**
 * Check email availability with backend using axios
 */
export const checkEmailAvailability = async (
  email: string,
): Promise<boolean> => {
  try {
    const response = await api.post(API_CONFIG.ENDPOINTS.AUTH.CHECK_EMAIL, {
      email,
    });
    const data = response.data as { available?: boolean };
    return data.available || false;
  } catch (error) {
    console.error("Check email availability error:", error);
    return false;
  }
};

/**
 * Check employee code availability with backend using axios
 */
export const checkEmployeeCodeAvailability = async (
  employeeCode: string,
): Promise<boolean> => {
  try {
    const response = await api.post(
      API_CONFIG.ENDPOINTS.AUTH.CHECK_EMPLOYEE_CODE,
      {
        employee_code: employeeCode,
      },
    );
    const data = response.data as { available?: boolean };
    return data.available || false;
  } catch (error) {
    console.error("Check employee code availability error:", error);
    return false;
  }
};

/**
 * Store user data after successful registration
 */
export const storeUserData = (
  userData: RegisterFormData,
  token?: string,
): void => {
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    }
    localStorage.setItem(USER_ROLE_KEY, "user");
    localStorage.setItem(
      "userName",
      `${userData.firstName} ${userData.lastName}`,
    );
    localStorage.setItem("userEmail", userData.email);
    localStorage.setItem("userPhone", userData.phone);
    localStorage.setItem("userEmployeeCode", userData.employeecode);

    // Set cookie with 1 day expiration
    const expires = new Date();
    expires.setDate(expires.getDate() + 1);
    if (token) {
      document.cookie = `${COOKIE_AUTH_TOKEN}=${token}; path=/; expires=${expires.toUTCString()}; SameSite=Strict`;
    }
  }
};

/**
 * Clear registration form data from storage
 */
export const clearRegistrationData = (): void => {
  if (typeof window !== "undefined") {
    const registrationKeys = [
      "registrationInProgress",
      "draftRegistrationData",
    ];

    registrationKeys.forEach((key) => {
      localStorage.removeItem(key);
    });
  }
};

/**
 * Save draft registration data
 */
export const saveDraftRegistration = (formData: RegisterFormData): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("draftRegistrationData", JSON.stringify(formData));
    localStorage.setItem("registrationInProgress", "true");
  }
};

/**
 * Load draft registration data
 */
export const loadDraftRegistration = (): RegisterFormData | null => {
  if (typeof window !== "undefined") {
    const draftData = localStorage.getItem("draftRegistrationData");
    if (draftData) {
      try {
        return JSON.parse(draftData);
      } catch (error) {
        console.error("Failed to parse draft registration data:", error);
      }
    }
  }
  return null;
};

/**
 * Check if registration is in progress
 */
export const isRegistrationInProgress = (): boolean => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("registrationInProgress") === "true";
  }
  return false;
};

/**
 * Get registration success redirect URL
 */
export const getRegistrationSuccessUrl = (defaultUrl: string = "/"): string => {
  if (typeof window !== "undefined") {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("redirect") || defaultUrl;
  }
  return defaultUrl;
};

/**
 * Format registration data for API submission
 */
export const formatRegistrationData = (formData: RegisterFormData) => {
  return {
    username: formData.username,
    employee_code: formData.employeecode,
    prefix: formData.prefix,
    first_name: formData.firstName,
    last_name: formData.lastName,
    phone: formData.phone,
    email: formData.email,
    password: formData.password,
  };
};
