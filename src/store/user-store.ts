// src/store/user-store.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface UserStore {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  clearUser: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      setUser: (user: User) => {
        set({
          user,
          isAuthenticated: true,
        });
      },

      clearUser: () => {
        set({
          user: null,
          isAuthenticated: false,
        });
      },

      updateUser: (updates: Partial<User>) => {
        const { user } = get();
        if (user) {
          set({
            user: { ...user, ...updates },
          });
        }
      },
    }),
    {
      name: "user-storage",
      skipHydration: true,
    },
  ),
);

// Helper functions for common operations
export const getUserFullName = (user: User | null): string => {
  if (!user) return "";
  return `${user.firstName} ${user.lastName}`.trim();
};

export const getUserInitials = (user: User | null): string => {
  if (!user) return "";
  const first = user.firstName.charAt(0).toUpperCase();
  const last = user.lastName.charAt(0).toUpperCase();
  return `${first}${last}`;
};

// Helper function to store user data (can be used outside React components)
export const storeUserData = (userData: User): void => {
  const { setUser } = useUserStore.getState();
  setUser(userData);
};

// Helper function to clear user data (can be used outside React components)
export const clearUserData = (): void => {
  const { clearUser } = useUserStore.getState();
  clearUser();
};
