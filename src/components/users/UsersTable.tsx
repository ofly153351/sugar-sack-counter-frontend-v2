"use client";

import Table from "@/components/table/table";
import { Search } from "lucide-react";
import { type User } from "@/utils/admin/users/user-api";

interface UsersTableProps {
  users: User[];
  search: string;
  onSearchChange: (value: string) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

export function UsersTable({
  users,
  search,
  onSearchChange,
  onEdit,
  onDelete,
  onRefresh,
  isLoading = false,
}: UsersTableProps) {
  const filteredUsers = users.filter((u) => {
    const keyword = search.toLowerCase();
    return (
      u.empCode.toLowerCase().includes(keyword) ||
      u.username?.toLowerCase().includes(keyword) ||
      u.firstname.toLowerCase().includes(keyword) ||
      u.lastname.toLowerCase().includes(keyword)
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดข้อมูลผู้ใช้งาน...</p>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
        <p className="text-gray-500 text-lg">No users found</p>
        <button
          onClick={onRefresh}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Refresh */}
      <div className="flex items-center justify-between">
        <div className="w-full max-w-md">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              size={18}
            />
            <input
              type="text"
              placeholder="ค้นหา..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm"
            />
          </div>
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow ml-4"
          title="Refresh users list"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            ></path>
          </svg>
          Refresh
        </button>
      </div>

      {/* Table */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500 text-lg">No users found</p>
          {search && (
            <p className="text-gray-400 mt-2">
              Try a different search term or{" "}
              <button
                onClick={() => onSearchChange("")}
                className="text-blue-600 hover:underline"
              >
                clear search
              </button>
            </p>
          )}
        </div>
      ) : (
        <Table
          type="users"
          data={filteredUsers}
          onEdit={onEdit}
          onDelete={onDelete}
          dict={{}}
        />
      )}
    </div>
  );
}
