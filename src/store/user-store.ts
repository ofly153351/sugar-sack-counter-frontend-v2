// src/store/user-store.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { StoreUser } from "@/utils/types";

// JWT token payload interface
interface JwtPayload {
  email: string;
  sub: string;
  role: string;
  iat: number;
  exp: number;
}

interface UserStore {
  user: StoreUser | null;
  isAuthenticated: boolean;
  setUser: (user: StoreUser) => void;
  clearUser: () => void;
  updateUser: (updates: Partial<StoreUser>) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      setUser: (user: StoreUser) => {
        if (typeof window !== "undefined") {
          console.log("👤 setUser called with:", user);
        }
        set({
          user,
          isAuthenticated: true,
        });
      },

      clearUser: () => {
        if (typeof window !== "undefined") {
          console.log("👤 clearUser called");
        }
        set({
          user: null,
          isAuthenticated: false,
        });
      },

      updateUser: (updates: Partial<StoreUser>) => {
        const { user } = get();
        if (user) {
          if (typeof window !== "undefined") {
            console.log("👤 updateUser called with updates:", updates);
          }
          set({
            user: { ...user, ...updates },
          });
        }
      },
    }),
    {
      name: "user-storage",
      skipHydration: true,
    }
  )
);

// Helper functions for common operations
export const getUserFullName = (user: StoreUser | null): string => {
  if (!user) return "";
  return `${user.firstName} ${user.lastName}`.trim();
};

export const getUserInitials = (user: StoreUser | null): string => {
  if (!user) return "";
  const first = user.firstName.charAt(0).toUpperCase();
  const last = user.lastName.charAt(0).toUpperCase();
  return `${first}${last}`;
};

// Helper function to store user data (can be used outside React components)
export const storeUserData = (userData: StoreUser): void => {
  const { setUser } = useUserStore.getState();
  setUser(userData);
};

// Helper function to clear user data (can be used outside React components)
export const clearUserData = (): void => {
  const { clearUser } = useUserStore.getState();
  clearUser();
};

// Decode JWT token to get user info
export const decodeJwtToken = (token: string): JwtPayload | null => {
  try {
    // JWT token format: header.payload.signature
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload) as JwtPayload;
  } catch (error) {
    console.error("Error decoding JWT token:", error);
    return null;
  }
};

// Check if token is expired
export const isTokenExpired = (token: string): boolean => {
  const payload = decodeJwtToken(token);
  if (!payload) return true;

  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
};

// Get token from cookies
export const getTokenFromCookies = (): string | null => {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "access_token" || name === "token") {
      return value;
    }
  }
  return null;
};

// Get user info from token
export const getUserInfoFromToken = (
  token: string
): Partial<StoreUser> | null => {
  const payload = decodeJwtToken(token);
  if (!payload) return null;

  return {
    email: payload.email,
    role: payload.role,
    // Note: JWT token doesn't contain firstName, lastName, etc.
    // We need to get full user data from API
  };
};

// Auth helper functions
export const checkAuthStatus = async (): Promise<{
  isAuthenticated: boolean;
  user: StoreUser | null;
  error?: string;
}> => {
  if (typeof window === "undefined") {
    return { isAuthenticated: false, user: null };
  }

  try {
    const response = await fetch("http://localhost:3001/api/users/me", {
      credentials: "include",
    });

    if (response.ok) {
      const userData = await response.json();
      const storeUser: StoreUser = {
        id: userData.id || "",
        email: userData.email || "",
        username: userData.username || "",
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        title: userData.title || "",
        phone: userData.phone || "",
        employeeCode: userData.employeeCode || "",
        role: userData.role || "user",
      };

      // Update store
      const { setUser } = useUserStore.getState();
      setUser(storeUser);

      return { isAuthenticated: true, user: storeUser };
    } else {
      // Clear user if auth failed
      clearUserData();
      return {
        isAuthenticated: false,
        user: null,
        error: `Auth failed: ${response.status} ${response.statusText}`,
      };
    }
  } catch (error) {
    console.error("Error checking auth status:", error);
    return {
      isAuthenticated: false,
      user: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const refreshAuthToken = async (): Promise<boolean> => {
  if (typeof window === "undefined") {
    return false;
  }

  // Development mock - always succeed in development
  if (process.env.NODE_ENV === "development") {
    console.log("🔧 Development mock: Token refresh succeeded");
    return true;
  }

  try {
    const response = await fetch("http://localhost:3001/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    if (response.ok) {
      console.log("✅ Auth token refreshed successfully");
      return true;
    }
    console.log(`❌ Token refresh failed: ${response.status}`);
    return false;
  } catch (error) {
    console.error("Error refreshing token:", error);
    return false;
  }
};

// Initialize user store from token
export const initializeUserFromToken = async (): Promise<StoreUser | null> => {
  // ตรวจสอบว่าเราอยู่ใน browser environment
  if (typeof window === "undefined") {
    console.log("🔄 initializeUserFromToken: Skipping on server side");
    return null;
  }

  console.log("🔄 initializeUserFromToken: Starting...");

  // Use the new checkAuthStatus helper
  const authResult = await checkAuthStatus();

  if (authResult.isAuthenticated && authResult.user) {
    console.log(
      "✅ initializeUserFromToken: User authenticated via checkAuthStatus:",
      authResult.user
    );
    return authResult.user;
  } else {
    console.log(
      "❌ initializeUserFromToken: Authentication failed:",
      authResult.error
    );

    // ตรวจสอบว่าเป็นหน้า auth หรือไม่ก่อนที่จะ clear user data
    const currentPath = window.location.pathname;
    const currentUrl = window.location.href;
    const isAuthPage =
      currentPath.includes("/login") ||
      currentPath.includes("/register") ||
      currentPath.includes("/auth") ||
      currentUrl.includes("/login") ||
      currentUrl.includes("/register") ||
      currentUrl.includes("/auth");

    // ตรวจสอบ locale prefix
    const pathSegments = currentPath.split("/").filter((segment) => segment);
    let isLocaleAuthPage = false;
    if (pathSegments.length >= 2) {
      const locale = pathSegments[0];
      const page = pathSegments[1];
      isLocaleAuthPage =
        (locale === "en" || locale === "th") &&
        (page === "login" || page === "register" || page === "auth");
    }

    if (!isAuthPage && !isLocaleAuthPage) {
      console.log("🔒 Authentication failed, clearing user data");
      clearUserData();
    } else {
      console.log(
        "⚠️ Authentication failed on auth page, skipping clearUserData"
      );
    }

    return null;
  }
};
