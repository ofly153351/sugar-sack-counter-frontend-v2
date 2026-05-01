"use client";

import { Dictionary } from "@/i18n/dictionaries";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Forklift,
  Package,
  LayoutDashboard,
  UserRound,
  UserCog,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface AdminSidebarProps {
  dict: Dictionary;
}

export default function AdminSidebar({ dict }: AdminSidebarProps) {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "th";
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const small = window.innerWidth <= 560;
      setIsSmallScreen(small);
      if (small) {
        setIsCollapsed(true);
      }
      if (process.env.NEXT_PUBLIC_DEBUG === "true") {
        console.log("[AdminSidebar] handleResize", {
          width: window.innerWidth,
          small,
        });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = [
    {
      key: "dashboard",
      label: dict.dashboard.sidebar.dashboard,
      href: `/${locale}/admin/dashboard`,
      icon: LayoutDashboard,
    },
    {
      key: "BagsInfo",
      label: dict.dashboard.sidebar.BagsInfo,
      href: `/${locale}/admin/BagsInfo`,
      icon: FileText,
    },
    {
      key: "BoxsInfo",
      label: dict.dashboard.sidebar.BoxsInfo,
      href: `/${locale}/admin/BoxsInfo`,
      icon: FileText,
    },
    {
      key: "VehicleInfo",
      label: dict.dashboard.sidebar.VehicleInfo,
      href: `/${locale}/admin/VehicleInfo`,
      icon: Forklift,
    },
    {
      key: "Products",
      label: dict.dashboard.sidebar.Products,
      href: `/${locale}/admin/Products`,
      icon: Package,
    },
    {
      key: "Users",
      label: dict.dashboard.sidebar.Users,
      href: `/${locale}/admin/Users`,
      icon: UserCog,
    },
    {
      key: "EmployeeInfo",
      label: dict.dashboard.sidebar.EmployeeInfo,
      href: `/${locale}/admin/EmployeeInfo`,
      icon: UserRound,
    },
  ];

  const isActive = (href: string) => {
    return pathname === href;
  };

  return (
    <>
      {isSmallScreen && (
        <button
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="fixed bottom-4 right-4 z-50 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50"
          title={isCollapsed ? "Open sidebar" : "Close sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-700" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          )}
        </button>
      )}
    <div
      className={`bg-gradient-to-b from-white to-gray-50 shadow-xl min-h-screen border-r border-gray-100 transition-all duration-300 ${
        isSmallScreen
          ? isCollapsed
            ? "w-16"
            : "fixed inset-0 z-40 w-full"
          : isCollapsed
          ? "w-20 lg:w-20"
          : "w-80 lg:w-80 md:w-64"
      }`}
    >
      {/* Navigation */}
      <nav
        className={`p-3 md:p-4 ${
          isCollapsed ? "px-2 md:px-3" : ""
        }`}
      >
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
                className={`group relative flex items-center text-sm font-medium rounded-lg md:rounded-xl transition-all duration-200 ${
                  isCollapsed
                    ? "px-2 py-2 md:px-3 md:py-3 justify-center h-9 md:h-10"
                    : "px-3 py-3 md:px-4 md:py-4 justify-between"
                } ${
                  active
                    ? "bg-gradient-to-r from-mp-green-600 to-sky-600 text-white shadow-lg shadow-mp-green-300/50"
                    : "text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-md border border-transparent hover:border-gray-200"
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <div
                  className={`flex items-center transition-all duration-300 ${
                    isCollapsed ? "justify-center" : "gap-3 min-w-0 flex-1"
                  }`}
                >
                  <div
                    className={`rounded-md md:rounded-lg transition-colors ${
                      isCollapsed ? "p-2 md:p-2.5" : "p-1.5 md:p-2"
                    }`}
                  >
                    <IconComponent
                      className={`w-3.5 h-3.5 md:w-4 md:h-4 transition-colors duration-200 ${
                        "text-gray-500"
                      }`}
                    />
                  </div>
                  <span
                    className={`font-medium transition-all duration-300 text-gray-700 ${
                      isCollapsed
                        ? "opacity-0 w-0 overflow-hidden"
                        : "opacity-100 truncate"
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

                {!isCollapsed && (
                  <ChevronRight
                    className={`w-3.5 h-3.5 md:w-4 md:h-4 transition-all duration-300 ${
                      active
                        ? "text-white"
                        : "text-gray-400 group-hover:text-gray-600"
                    } ${
                      active
                        ? "translate-x-0"
                        : "-translate-x-1 group-hover:translate-x-0"
                    }`}
                  />
                )}
              </Link>
            );
          })}
        </div>
        <div className="mt-20 flex justify-center">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-10 h-10 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:shadow-lg transition-all duration-300"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft
              className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${
                isCollapsed ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

      </nav>
    </div>
    </>
  );
}
