"use client";

import { Dictionary } from "@/i18n/dictionaries";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Forklift,
  LayoutDashboard,
  UserCog,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface AdminSidebarProps {
  dict: Dictionary;
}

export default function AdminSidebar({ dict }: AdminSidebarProps) {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "th";
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    {
      key: "dashboard",
      label: dict.dashboard.sidebar.dashboard,
      href: `/${locale}/admin/dashboard`,
      icon: LayoutDashboard,
    },
    {
      key: "SugarBagsInfo",
      label: dict.dashboard.sidebar.SugarBagsInfo,
      href: `/${locale}/admin/SugarBagsInfo`,
      icon: FileText,
    },
    {
      key: "SugarBoxsInfo",
      label: dict.dashboard.sidebar.SugarBoxsInfo,
      href: `/${locale}/admin/SugarBoxsInfo`,
      icon: FileText,
    },
    {
      key: "VehicleInfo",
      label: dict.dashboard.sidebar.VehicleInfo,
      href: `/${locale}/admin/VehicleInfo`,
      icon: Forklift,
    },
    {
      key: "Users",
      label: dict.dashboard.sidebar.Users,
      href: `/${locale}/admin/Users`,
      icon: UserCog,
    },
  ];

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const isActive = (href: string) => {
    return pathname === href;
  };

  return (
    <div
      className={`bg-gradient-to-b from-white to-gray-50 shadow-xl min-h-screen border-r border-gray-100 transition-all duration-300 relative ${
        isCollapsed ? "w-20 lg:w-20" : "w-80 lg:w-80"
      } md:w-64`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:shadow-xl transition-all duration-300 z-20"
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <ChevronLeft
          className={`w-4 h-4 text-gray-600 transition-transform duration-300 ${
            isCollapsed ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Navigation */}
      <nav className={`p-3 md:p-4 ${isCollapsed ? "px-2 md:px-3" : ""}`}>
        <div
          className={`space-y-1 md:space-y-2 ${
            isCollapsed ? "space-y-2 md:space-y-3" : ""
          }`}
        >
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.key}
                href={item.href}
                className={`group relative flex items-center justify-between text-sm font-medium rounded-lg md:rounded-xl transition-all duration-200 ${
                  isCollapsed
                    ? "px-2 py-2 md:px-3 md:py-3"
                    : "px-3 py-3 md:px-4 md:py-4"
                } ${
                  active
                    ? "bg-gradient-to-r from-mp-green-700 to-blue-700 text-white shadow-lg shadow-mp-green-300/50"
                    : "text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-md border border-transparent hover:border-gray-200"
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <div
                  className={`flex items-center transition-all duration-300 ${
                    isCollapsed ? "justify-center" : "gap-3"
                  }`}
                >
                  <div
                    className={`rounded-md md:rounded-lg transition-colors ${
                      isCollapsed ? "p-2 md:p-2.5" : "p-1.5 md:p-2"
                    } ${
                      active
                        ? "bg-white/20"
                        : "bg-gray-100 group-hover:bg-blue-50"
                    }`}
                  >
                    <IconComponent
                      className={`w-3.5 h-3.5 md:w-4 md:h-4 transition-colors duration-200 ${
                        active
                          ? "text-white"
                          : "text-gray-500 group-hover:text-blue-600"
                      }`}
                    />
                  </div>
                  <span
                    className={`font-medium transition-all duration-300 ${
                      isCollapsed
                        ? "opacity-0 w-0 overflow-hidden"
                        : "opacity-100"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>

                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 whitespace-nowrap">
                    {item.label}
                  </div>
                )}

                <ChevronRight
                  className={`w-3.5 h-3.5 md:w-4 md:h-4 transition-all duration-300 ${
                    active
                      ? "text-white"
                      : "text-gray-400 group-hover:text-gray-600"
                  } ${
                    active
                      ? "translate-x-0"
                      : "-translate-x-1 group-hover:translate-x-0"
                  } ${
                    isCollapsed ? "opacity-0 scale-0" : "opacity-100 scale-100"
                  }`}
                />
              </Link>
            );
          })}
        </div>

        {/* Footer Section */}
        {!isCollapsed && (
          <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-gray-100">
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg md:rounded-xl p-3 md:p-4 border border-orange-100">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-orange-400 to-yellow-400 flex items-center justify-center">
                  <span className="text-white text-xs md:text-sm font-bold">
                    MP
                  </span>
                </div>
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-800">
                    Sugar Sack Counter
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5 md:mt-1">v2.0.0</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}
