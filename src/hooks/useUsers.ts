"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchUsers,
  createUser,
  updateUser,
  updateUserRole,
  deleteUser,
  getUserById,
  type User,
  type UserFormData,
  type ApiUser,
} from "@/utils/admin/users/user-api";
import Swal from "sweetalert2";
import { useTranslations } from "next-intl";

// Query keys for React Query
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters: { search?: string } = {}) =>
    [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string | number) => [...userKeys.details(), id] as const,
};

// Hook for fetching all users
export function useUsers() {
  return useQuery({
    queryKey: userKeys.list(),
    queryFn: fetchUsers,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for fetching a single user by ID
export function useUser(id: string | number) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => getUserById(id),
    enabled: !!id,
    staleTime: 60 * 1000,
  });
}

// Hook for creating a new user
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: (data) => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
    onError: (error: Error) => {
      console.error("❌ Error creating user:", error);
    },
  });
}

// Hook for updating a user
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string | number;
      data: Partial<UserFormData>;
    }) => updateUser(id, data),
    onSuccess: (data, variables) => {
      // Invalidate both the list and the specific user detail
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: userKeys.detail(variables.id),
      });
    },
    onError: (error: Error) => {
      console.error("❌ Error updating user:", error);
    },
  });
}

// Hook for updating a user's role
export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      role,
    }: {
      id: string | number;
      role: "admin" | "user" | "operator" | "viewer";
    }) => updateUserRole(id, role),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: userKeys.detail(variables.id),
      });
    },
    onError: (error: Error) => {
      console.error("❌ Error updating user role:", error);
    },
  });
}

// Hook for deleting a user
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: (_, userId) => {
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
    onError: (error: Error) => {
      console.error("❌ Error deleting user:", error);
    },
  });
}

// Hook for confirming user deletion with SweetAlert2
export function useConfirmDeleteUser() {
  const deleteUserMutation = useDeleteUser();
  const t = useTranslations("users");

  const confirmDelete = (user: User) => {
    Swal.fire({
      title: t("delete.confirm"),
      text: `${user.firstname} ${user.lastname}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("delete.confirmButton", { defaultValue: "ลบ" }),
      cancelButtonText: t("buttons.cancel", { defaultValue: "ยกเลิก" }),
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    }).then((result) => {
      if (result.isConfirmed) {
        // Use backend ID if available, otherwise use no as fallback
        const userId = user.id || user.no;
        deleteUserMutation.mutate(userId, {
          onSuccess: () => {
            Swal.fire({
              title: t("delete.success"),
              icon: "success",
              confirmButtonText: t("buttons.ok"),
            });
          },
          onError: (error: Error) => {
            Swal.fire({
              title: t("delete.error"),
              text: error.message || t("delete.error"),
              icon: "error",
              confirmButtonText: t("buttons.ok"),
            });
          },
        });
      }
    });
  };

  return {
    confirmDelete,
    isLoading: deleteUserMutation.isPending,
  };
}

// Hook for managing users with all operations
export function useUsersManager() {
  const usersQuery = useUsers();
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const updateUserRoleMutation = useUpdateUserRole();
  const { confirmDelete } = useConfirmDeleteUser();

  return {
    // Query state
    users: usersQuery.data || [],
    isLoading: usersQuery.isLoading,
    isError: usersQuery.isError,
    error: usersQuery.error,
    refetch: usersQuery.refetch,

    // Mutations
    createUser: createUserMutation.mutate,
    isCreating: createUserMutation.isPending,
    updateUser: updateUserMutation.mutate,
    isUpdating: updateUserMutation.isPending,
    updateUserRole: updateUserRoleMutation.mutate,
    isUpdatingRole: updateUserRoleMutation.isPending,
    deleteUser: confirmDelete,

    // Combined loading state
    isProcessing:
      createUserMutation.isPending ||
      updateUserMutation.isPending ||
      updateUserRoleMutation.isPending,
  };
}
