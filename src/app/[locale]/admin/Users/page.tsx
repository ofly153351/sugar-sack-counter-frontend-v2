"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  convertToUserFormData,
  type User,
  type UserFormData,
} from "@/utils/admin/users/user-api";
import { UsersHeader, UsersTable, UserModal } from "@/components/users";

const usersDefault: User[] = [];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(usersDefault);
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch users from API
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiUsers = await fetchUsers();
      setUsers(apiUsers);
    } catch (err: any) {
      console.error("❌ Error fetching users:", err);
      setError(err.message || "Failed to load users");
      Swal.fire("Error", "Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDelete = async (user: User) => {
    Swal.fire({
      title: "ต้องการลบผู้ใช้งานนี้หรือไม่?",
      text: `${user.firstname} ${user.lastname}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Use backend ID if available, otherwise use no as fallback
          const userId = user.id || user.no;
          await deleteUser(userId);

          // Update local state
          setUsers((prev) => prev.filter((u) => u.no !== user.no));
          Swal.fire("ลบแล้ว!", "ข้อมูลถูกลบเรียบร้อย", "success");
        } catch (err: any) {
          console.error("❌ Error deleting user:", err);
          Swal.fire("Error", "Failed to delete user", "error");
        }
      }
    });
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
        await updateUser(userId, userData);
        Swal.fire("สำเร็จ!", "ข้อมูลผู้ใช้งานถูกอัปเดตเรียบร้อย", "success");
      } else {
        // Create new user
        await createUser(userData);
        Swal.fire("สำเร็จ!", "ผู้ใช้งานถูกสร้างเรียบร้อย", "success");
      }

      // Refresh users list
      await loadUsers();
      setModalOpen(false);
      setEditUser(null);
    } catch (err: any) {
      console.error("❌ Error saving user:", err);
      Swal.fire("Error", err.message || "Failed to save user", "error");
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

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดข้อมูลผู้ใช้งาน...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-bold">Error loading users</p>
          <p>{error}</p>
          <button
            onClick={loadUsers}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <UsersHeader onAddUser={handleAddUser} />

      <UsersTable
        users={users}
        search={search}
        onSearchChange={setSearch}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRefresh={loadUsers}
        isLoading={loading}
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
