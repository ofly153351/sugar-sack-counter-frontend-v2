// src/utils/admin/users/user-api.ts

import { api } from "../../api-client";
import { API_CONFIG } from "../../config";
import type { User, UserFormData, ApiUser } from "../../types";

export type { User, UserFormData, ApiUser } from "../../types";

// Types are now imported from src/utils/types.ts
export interface CreateUserMinimalPayload {
  username: string;
  password: string;
}

/**
 * Fetch all users from API
 */
export const fetchUsers = async (): Promise<User[]> => {
  try {
    console.log("📡 Fetching users from API...");
    const response = await api.get("/users");
    console.log("✅ Users API response received");

    const apiUsers = response.data as ApiUser[];

    return apiUsers.map((user, index) => ({
      no: index + 1,
      empCode: user.employeeCode || user.empCode || "-",
      firstname: user.firstName || user.firstname || "",
      lastname: user.lastName || user.lastname || "",
      role: user.role || "user", // Keep role for compatibility but use backend value
      title: user.title || "Mr.", // Add title field
      phone: user.phone || "",
      email: user.email || "",
      username: user.username || "",
      password: "", // Not returned from API for security
      id: user.id, // Store backend ID for updates
    }));
  } catch (error: any) {
    console.error("❌ Error fetching users:", error);
    throw new Error(error.message || "Failed to load users");
  }
};

/**
 * Create a new user
 */
export const createUser = async (
  userData: CreateUserMinimalPayload
): Promise<ApiUser> => {
  try {
    console.log("➕ Creating new user:", userData);
    const response = await api.post("/users", userData);
    console.log("✅ User created successfully:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Error creating user:", error);

    let errorMessage = "Failed to create user";
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
};

/**
 * Update an existing user
 */
export const updateUser = async (
  userId: string | number,
  userData: Partial<UserFormData>
): Promise<ApiUser> => {
  try {
    // Filter out empty string fields before sending
    const filteredData: Partial<UserFormData> = {};

    for (const [key, value] of Object.entries(userData)) {
      // Only include non-empty values
      if (value !== undefined && value !== null && value !== "") {
        filteredData[key as keyof UserFormData] = value;
      }
    }

    console.log(`✏️ Updating user with ID: ${userId}`);
    console.log(`🔍 Original data:`, userData);
    console.log(`🔍 Filtered data (to send):`, filteredData);
    console.log(`🔍 Full API URL: ${API_CONFIG.BASE_URL}/users/${userId}`);
    console.log(`🔍 Request method: PATCH`);

    const response = await api.patch(`/users/${userId}`, filteredData);

    console.log("✅ User updated successfully");
    console.log(`🔍 Response status: ${response.status}`);
    console.log(`🔍 Response data:`, response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Error updating user:", error);
    console.error(`🔍 Error details:`, {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
      },
    });

    let errorMessage = "Failed to update user";
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
};

/**
 * Update user role (admin only)
 */
export const updateUserRole = async (
  userId: string | number,
  role: "admin" | "user" | "operator" | "viewer"
): Promise<ApiUser> => {
  try {
    console.log(`🔧 Updating role for user ID: ${userId} -> ${role}`);
    const response = await api.patch(`/admin/users/${userId}/role`, { role });
    console.log("✅ User role updated successfully");
    return response.data;
  } catch (error: any) {
    console.error("❌ Error updating user role:", error);

    let errorMessage = "Failed to update user role";
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
};

/**
 * Delete a user
 */
export const deleteUser = async (userId: string | number): Promise<void> => {
  try {
    console.log(`🗑️ Deleting user with ID: ${userId}`);
    console.log(`🔍 Full API URL: ${API_CONFIG.BASE_URL}/users/${userId}`);
    console.log(`🔍 Request method: DELETE`);

    const response = await api.delete(`/users/${userId}`);
    console.log("✅ User deleted successfully");
    console.log(`🔍 Response status: ${response.status}`);
    console.log(`🔍 Response data:`, response.data);
  } catch (error: any) {
    console.error("❌ Error deleting user:", error);
    console.error(`🔍 Error details:`, {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
      },
    });

    let errorMessage = "Failed to delete user";
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (userId: string | number): Promise<User> => {
  try {
    console.log(`🔍 Fetching user with ID: ${userId}`);
    const response = await api.get(`/users/${userId}`);
    console.log("✅ User fetched successfully:", response.data);

    const user = response.data as ApiUser;

    return {
      no: 1, // Will be updated by parent component
      empCode: user.employeeCode || user.empCode || "-",
      firstname: user.firstName || user.firstname || "",
      lastname: user.lastName || user.lastname || "",
      role: user.role || "พนักงาน",
      phone: user.phone || "",
      email: user.email || "",
      username: user.username || "",
      password: "", // Not returned from API for security
      id: user.id,
    };
  } catch (error: any) {
    console.error("❌ Error fetching user:", error);

    let errorMessage = "Failed to fetch user";
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
};

/**
 * Convert User to UserFormData for API submission
 */
export const convertToUserFormData = (user: User): UserFormData => {
  const formData: UserFormData = {
    email: user.email || "",
    username: user.username || "",
    firstName: user.firstname,
    lastName: user.lastname,
    employeeCode: user.empCode,
    phone: user.phone || "",
    title: user.title || "Mr.",
  };

  // Only include password if it's not empty (for new users or password changes)
  if (user.password && user.password.trim() !== "") {
    formData.password = user.password;
  }

  return formData;
};

/**
 * Search users by keyword
 */
export const searchUsers = async (keyword: string): Promise<User[]> => {
  try {
    console.log(`🔍 Searching users with keyword: ${keyword}`);

    // If backend supports search endpoint, use it
    // Otherwise, fetch all and filter client-side
    const allUsers = await fetchUsers();

    const filteredUsers = allUsers.filter((user) => {
      const searchTerm = keyword.toLowerCase();
      return (
        user.empCode.toLowerCase().includes(searchTerm) ||
        user.username?.toLowerCase().includes(searchTerm) ||
        user.firstname.toLowerCase().includes(searchTerm) ||
        user.lastname.toLowerCase().includes(searchTerm) ||
        user.email?.toLowerCase().includes(searchTerm) ||
        user.phone?.toLowerCase().includes(searchTerm)
      );
    });

    return filteredUsers;
  } catch (error: any) {
    console.error("❌ Error searching users:", error);
    throw new Error(error.message || "Failed to search users");
  }
};

/**
 * Validate user data before submission
 */
export const validateUserData = (
  userData: UserFormData
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!userData.username?.trim()) {
    errors.push("Username is required");
  }

  if (!userData.employeeCode?.trim()) {
    errors.push("Employee code is required");
  }

  if (!userData.firstName?.trim()) {
    errors.push("First name is required");
  }

  if (!userData.lastName?.trim()) {
    errors.push("Last name is required");
  }

  if (!userData.role?.trim()) {
    errors.push("Role is required");
  }

  if (!userData.phone?.trim()) {
    errors.push("Phone number is required");
  }

  if (!userData.email?.trim()) {
    errors.push("Email is required");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
    errors.push("Invalid email format");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Get user roles (can be extended based on backend)
 */
export const getUserRoles = (): string[] => {
  return ["พนักงาน", "ผู้จัดการ", "แอดมิน"];
};

/**
 * Check if username is available
 */
export const checkUsernameAvailability = async (
  username: string
): Promise<boolean> => {
  try {
    // If backend has username check endpoint, use it
    // For now, fetch all users and check client-side
    const allUsers = await fetchUsers();
    const existingUser = allUsers.find(
      (user) => user.username?.toLowerCase() === username.toLowerCase()
    );
    return !existingUser;
  } catch (error) {
    console.error("❌ Error checking username availability:", error);
    return false; // Assume not available on error
  }
};

/**
 * Check if employee code is available
 */
export const checkEmployeeCodeAvailability = async (
  empCode: string
): Promise<boolean> => {
  try {
    const allUsers = await fetchUsers();
    const existingUser = allUsers.find(
      (user) => user.empCode.toLowerCase() === empCode.toLowerCase()
    );
    return !existingUser;
  } catch (error) {
    console.error("❌ Error checking employee code availability:", error);
    return false; // Assume not available on error
  }
};

export default {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserById,
  convertToUserFormData,
  searchUsers,
  validateUserData,
  getUserRoles,
  checkUsernameAvailability,
  checkEmployeeCodeAvailability,
};
