"use client";

import { useUserStore, getUserFullName } from "@/store/user-store";

export default function AdminDashboard() {
  const { user, isAuthenticated } = useUserStore();

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      {isAuthenticated && user ? (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-lg font-semibold mb-4">User Information</h2>
          <div className="space-y-2">
            <p>
              <strong>Name:</strong> {getUserFullName(user)}
            </p>
            <p>
              <strong>Username:</strong> {user.username}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>User ID:</strong> {user.id}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
          <p className="text-yellow-800">No user information available.</p>
        </div>
      )}

      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-gray-600">
          Welcome to the admin dashboard. Only authenticated users can access
          this page.
        </p>
      </div>
    </main>
  );
}
