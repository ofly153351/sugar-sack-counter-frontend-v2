"use client";

import Table from "@/components/table/table";
import { Search } from "lucide-react";
import { type User } from "@/utils/admin/users/user-api";
import { useTranslations } from "next-intl";

interface UsersTableProps {
  users: User[];
  search: string;
  sortOrder: "asc" | "desc";
  currentUserId?: string;
  currentUsername?: string;
  currentEmail?: string;
  onSearchChange: (value: string) => void;
  onSortOrderChange: (value: "asc" | "desc") => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onRoleChange?: (user: User, role: "admin" | "user" | "operator" | "viewer") => void;
  isRoleUpdating?: boolean;
  isLoading?: boolean;
}

export function UsersTable({
  users,
  search,
  sortOrder,
  currentUserId,
  currentUsername,
  currentEmail,
  onSearchChange,
  onSortOrderChange,
  onEdit,
  onDelete,
  onRoleChange,
  isRoleUpdating = false,
  isLoading = false,
}: UsersTableProps) {
  const t = useTranslations("users");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (users.length === 0 && !search) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
        <p className="text-gray-500 text-lg">{t("noUsers")}</p>
        <p className="text-gray-400 mt-2">{t("noUsersInSystem")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center justify-between">
        <div className="w-full max-w-md">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              size={18}
            />
            <input
              type="text"
              placeholder={t("search")}
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      {users.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500 text-lg">{t("noUsers")}</p>
          {search && (
            <p className="text-gray-400 mt-2">
              {t("tryDifferentSearch") || "Try a different search term or"}{" "}
              <button
                onClick={() => onSearchChange("")}
                className="text-blue-600 hover:underline"
              >
                {t("clearSearch")}
              </button>
            </p>
          )}
        </div>
      ) : (
        <Table
          type="users"
          data={users}
          sortOrder={sortOrder}
          onSortOrderChange={onSortOrderChange}
          onEdit={onEdit}
          onDelete={onDelete}
          onRoleChange={onRoleChange}
          isRoleSelectable={(userRow) => {
            const isSelfById =
              !!currentUserId && String(userRow.id) === String(currentUserId);
            const isSelfByUsername =
              !!currentUsername &&
              String(userRow.username || "").toLowerCase() ===
                String(currentUsername).toLowerCase();
            const isSelfByEmail =
              !!currentEmail &&
              String(userRow.email || "").toLowerCase() ===
                String(currentEmail).toLowerCase();

            return !(isSelfById || isSelfByUsername || isSelfByEmail);
          }}
          isRoleUpdating={isRoleUpdating}
        />
      )}
    </div>
  );
}
