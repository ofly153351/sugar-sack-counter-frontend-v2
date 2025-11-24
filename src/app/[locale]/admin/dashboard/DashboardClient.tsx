"use client";

import { useUserStore, getUserFullName } from "@/store/user-store";
import { Dictionary } from "@/i18n/dictionaries";

interface DashboardClientProps {
  dict: Dictionary;
}

export default function DashboardClient({ dict }: DashboardClientProps) {
  const { user, isAuthenticated } = useUserStore();

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">{dict.dashboard.title}</h1>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-blue-800">
              {dict.dashboard.metrics.vehiclesIn}
            </h3>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-bold text-sm">IN2</span>
            </div>
          </div>
          <p className="text-4xl font-bold text-blue-700 mb-2">24</p>
          <div className="flex items-center text-sm text-blue-600">
            <span className="bg-blue-100 px-2 py-1 rounded-full font-medium">
              Today
            </span>
            <span className="ml-2 text-green-600 font-medium">+12%</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-2xl shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-green-800">
              {dict.dashboard.metrics.vehiclesOut}
            </h3>
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-green-600 font-bold text-sm">OUT</span>
            </div>
          </div>
          <p className="text-4xl font-bold text-green-700 mb-2">18</p>
          <div className="flex items-center text-sm text-green-600">
            <span className="bg-green-100 px-2 py-1 rounded-full font-medium">
              Today
            </span>
            <span className="ml-2 text-green-600 font-medium">+8%</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-white p-6 rounded-2xl shadow-lg border border-orange-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-orange-800">
              {dict.dashboard.metrics.bagsOut}
            </h3>
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <span className="text-orange-600 font-bold text-sm">BAG</span>
            </div>
          </div>
          <p className="text-4xl font-bold text-orange-700 mb-2">1,250</p>
          <div className="flex items-center text-sm text-orange-600">
            <span className="bg-orange-100 px-2 py-1 rounded-full font-medium">
              Total
            </span>
            <span className="ml-2 text-green-600 font-medium">+15%</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-2xl shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-purple-800">
              {dict.dashboard.metrics.boxesOut}
            </h3>
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-purple-600 font-bold text-sm">BOX</span>
            </div>
          </div>
          <p className="text-4xl font-bold text-purple-700 mb-2">480</p>
          <div className="flex items-center text-sm text-purple-600">
            <span className="bg-purple-100 px-2 py-1 rounded-full font-medium">
              Total
            </span>
            <span className="ml-2 text-green-600 font-medium">+22%</span>
          </div>
        </div>
      </div>

      {isAuthenticated && user ? (
        <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-lg border border-gray-100 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-mp-green-500 to-blue-500 flex items-center justify-center">
              <span className="text-white text-sm font-bold">U</span>
            </div>
            {dict.dashboard.userInfo}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">
                {dict.dashboard.name}
              </p>
              <p className="text-lg font-semibold text-gray-800">
                {getUserFullName(user)}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">
                {dict.dashboard.username}
              </p>
              <p className="text-lg font-semibold text-gray-800">
                {user.username}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">
                {dict.dashboard.email}
              </p>
              <p className="text-lg font-semibold text-gray-800">
                {user.email}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">
                {dict.dashboard.userId}
              </p>
              <p className="text-lg font-semibold text-gray-800">{user.id}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-2xl shadow-lg border border-yellow-200 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
              <span className="text-yellow-600 text-lg">⚠️</span>
            </div>
            <div>
              <p className="text-yellow-800 font-medium">
                {dict.dashboard.noUserInfo}
              </p>
              <p className="text-yellow-600 text-sm mt-1">
                Please log in to view user information
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-mp-green-50 to-blue-50 p-6 rounded-2xl shadow-lg border border-mp-green-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-mp-green-500 to-blue-500 flex items-center justify-center">
            <span className="text-white text-lg">🎯</span>
          </div>
          <div>
            <p className="text-gray-800 font-medium text-lg">
              {dict.dashboard.welcomeMessage}
            </p>
            <p className="text-gray-600 text-sm mt-1">
              Manage your sugar sack counting operations efficiently
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
