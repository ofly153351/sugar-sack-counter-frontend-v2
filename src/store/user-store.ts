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

// Initialize user store from token
export const initializeUserFromToken = async (): Promise<StoreUser | null> => {
  // ตรวจสอบว่าเราอยู่ใน browser environment
  if (typeof window === "undefined") {
    console.log("🔄 initializeUserFromToken: Skipping on server side");
    return null;
  }

  console.log("🔄 initializeUserFromToken: Starting...");

  try {
    // สำหรับ HttpOnly cookies เราไม่สามารถอ่าน token ได้จาก JavaScript
    // ดังนั้นเราจะเรียก API เพื่อตรวจสอบ authentication และดึงข้อมูลผู้ใช้
    console.log("🌐 Calling API: http://localhost:3001/api/users/me");
    const response = await fetch("http://localhost:3001/api/users/me", {
      credentials: "include",
    });

    console.log(
      "📊 API Response status:",
      response.status,
      response.statusText
    );

    if (response.ok) {
      const userData = await response.json();
      console.log("✅ User data fetched from API:", userData);

      // Store in Zustand
      const { setUser } = useUserStore.getState();
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

      setUser(storeUser);
      console.log(
        "✅ User data initialized from API and stored in Zustand:",
        storeUser
      );
      return storeUser;
    } else {
      // ถ้า API return 401/403 แสดงว่าไม่ authenticated
      console.log("❌ User not authenticated, API returned:", response.status);

      // ตรวจสอบว่าเป็น error 401/403 หรือไม่
      if (response.status === 401 || response.status === 403) {
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
        const pathSegments = currentPath
          .split("/")
          .filter((segment) => segment);
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
      }

      return null;
    }
  } catch (error) {
    console.error("❌ Error fetching user data from API:", error);

    // ในหน้า auth ไม่ต้อง clear user data เพราะผู้ใช้กำลัง login
    // ตรวจสอบอีกครั้งว่าเป็นหน้า auth หรือไม่
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
      // เฉพาะหน้าที่ไม่ใช่ auth page ให้ clear user data
      console.log("🔒 Clearing user data due to API error on non-auth page");
      clearUserData();
    } else {
      console.log("⚠️ API error on auth page, skipping clearUserData");
    }

    return null;
  }
};
