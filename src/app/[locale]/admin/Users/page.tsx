"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import {
  convertToUserFormData,
  type User,
  type UserFormData,
} from "@/utils/admin/users/user-api";
import { UsersHeader, UsersTable, UserModal } from "@/components/users";
import { useUsersManager } from "@/hooks/useUsers";
import { useTranslations } from "next-intl";
import { useUserStore } from "@/store/user-store";

export default function UsersPage() {
  const t = useTranslations("users");
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const { user: currentUser } = useUserStore();

  // Use React Query hooks
  const usersManager = useUsersManager();
  // Filter users client-side based on search
  const filteredUsers = usersManager.users
    .filter((user) => {
      if (!currentUser) return true;
      return !(
        (currentUser.id && user.id === currentUser.id) ||
        (currentUser.username && user.username === currentUser.username) ||
        (currentUser.email && user.email === currentUser.email)
      );
    })
    .filter((user) => {
      const keyword = search.toLowerCase();
      return (
        user.empCode.toLowerCase().includes(keyword) ||
        user.username?.toLowerCase().includes(keyword) ||
        user.firstname.toLowerCase().includes(keyword) ||
        user.lastname.toLowerCase().includes(keyword) ||
        user.email?.toLowerCase().includes(keyword) ||
        user.phone?.toLowerCase().includes(keyword)
      );
    })
    .sort((a, b) => {
      const compared = (a.empCode ?? "").localeCompare(b.empCode ?? "", undefined, {
        numeric: true,
        sensitivity: "base",
      });
      return sortOrder === "asc" ? compared : -compared;
    })
    .map((user, index) => ({
      ...user,
      no: index + 1,
    }));

  const isLoading = usersManager.isLoading;
  const isError = usersManager.isError;
  const error = usersManager.error;

  const handleDelete = async (user: User) => {
    // The delete confirmation is handled inside useConfirmDeleteUser hook
    usersManager.deleteUser(user);
  };

  const handleRoleChange = (
    user: User,
    role: "admin" | "user" | "operator" | "viewer"
  ) => {
    const userId = user.id || user.no;
    usersManager.updateUserRole(
      { id: userId, role },
      {
        onSuccess: () => {
          Swal.fire({
            title: t("role.updateSuccess", { defaultValue: "อัปเดตสิทธิ์แล้ว" }),
            icon: "success",
            confirmButtonText: t("buttons.ok"),
          });
        },
        onError: (error: Error) => {
          Swal.fire({
            title: t("role.updateError", { defaultValue: "อัปเดตสิทธิ์ไม่สำเร็จ" }),
            text: error.message || t("role.updateError"),
            icon: "error",
            confirmButtonText: t("buttons.ok"),
          });
        },
      }
    );
  };

  const handleEdit = (user: User) => {
    setEditUser(user);
    setModalOpen(true);
  };

  const handleSave = async (user: User) => {
    try {
      const userData: UserFormData = convertToUserFormData(user);

      if (editUser) {
        // Update existing user
        const userId = editUser.id || editUser.no;
        usersManager.updateUser(
          { id: userId, data: userData },
          {
            onSuccess: () => {
              // Show success message
              Swal.fire({
                title: t("save.updateSuccess"),
                icon: "success",
                confirmButtonText: t("buttons.ok"),
              });
              // Close modal
              setModalOpen(false);
              setEditUser(null);
            },
            onError: (error: Error) => {
              Swal.fire({
                title: t("save.error"),
                text: error.message || t("save.error"),
                icon: "error",
                confirmButtonText: t("buttons.ok"),
              });
            },
          }
        );
      } else {
        // Create new user
        usersManager.createUser(userData, {
          onSuccess: () => {
            // Show success message
            Swal.fire({
              title: t("save.createSuccess"),
              icon: "success",
              confirmButtonText: t("buttons.ok"),
            });
            // Close modal
            setModalOpen(false);
            setEditUser(null);
          },
          onError: (error: Error) => {
            Swal.fire({
              title: t("save.error"),
              text: error.message || t("save.error"),
              icon: "error",
              confirmButtonText: t("buttons.ok"),
            });
          },
        });
      }
    } catch (err: unknown) {
      console.error("❌ Error saving user:", err);
      const errorMessage = err instanceof Error ? err.message : t("save.error");
      Swal.fire(t("save.error"), errorMessage, "error");
    }
  };

  const handleAddUser = () => {
    setEditUser(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditUser(null);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-bold">{t("errors.loadError")}</p>
          <p>{error?.message || "Unknown error occurred"}</p>
          <button
            onClick={() => usersManager.refetch()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            {t("buttons.retry")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      <UsersHeader onAddUser={handleAddUser} />

      <UsersTable
        users={filteredUsers}
        search={search}
        sortOrder={sortOrder}
        onSearchChange={setSearch}
        onSortOrderChange={setSortOrder}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
        onRoleChange={handleRoleChange}
        isRoleUpdating={usersManager.isUpdatingRole}
      />

      <UserModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        initialData={editUser}
        onSave={handleSave}
      />
    </div>
  );
}
