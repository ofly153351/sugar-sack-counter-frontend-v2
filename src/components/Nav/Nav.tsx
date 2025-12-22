"use client";

import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Navbar,
  NavbarBrand,
  NavbarContent,
} from "@heroui/react";
import { LogOut, Settings, User, Loader2 } from "lucide-react";
import Logo from "../logo/logo";
import { useRouter, usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { API_CONFIG } from "@/utils/config";

export default function Nav() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const t = useTranslations();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Get current locale for display with fallback - computed directly during render
  const getCurrentLocale = useCallback(() => {
    // Use params first for consistent server/client rendering
    if (params?.locale) {
      const locale = params.locale as string;
      return locale === "en" || locale === "th" ? locale : "th";
    }

    // Fallback to pathname parsing
    const pathSegments = pathname.split("/");
    if (pathSegments.length < 2) return "th";

    const locale = pathSegments[1];
    return locale === "en" || locale === "th" ? locale : "th";
  }, [params, pathname]);

  const currentLocale = getCurrentLocale();
  const handleLanguageChange = (newLocale: string) => {
    const pathSegments = pathname.split("/");

    if (pathSegments.length < 2) {
      // If no locale in path, redirect to home with new locale
      router.push(`/${newLocale}/home`);
      return;
    }

    // Check if current segment is a valid locale
    const currentPathLocale = pathSegments[1];
    const isValidLocale =
      currentPathLocale === "en" || currentPathLocale === "th";

    if (isValidLocale) {
      // Replace the locale segment while preserving the rest of the path
      pathSegments[1] = newLocale;
      const newPathname = pathSegments.join("/");
      router.push(newPathname);
    } else {
      // If current path doesn't have a valid locale, prepend the new locale
      const newPathname = `/${newLocale}${pathname}`;
      router.push(newPathname);
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.LOGOUT}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        // Redirect to login page after successful logout
        router.push(`/${currentLocale}/login`);
      } else {
        console.error("Logout failed with status:", response.status);
        // Optionally show error message to user
        alert(
          t("logoutFailed", {
            defaultValue: "Logout failed. Please try again.",
          })
        );
      }
    } catch (error) {
      console.error("Error during logout:", error);
      alert(
        t("logoutError", {
          defaultValue: "An error occurred during logout. Please try again.",
        })
      );
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Navbar className="px-3 py-4 bg-white shadow-sm border-b border-gray-200 h-18 z-30  justify-between">
      <NavbarBrand className="flex items-center gap-2">
        <Logo width={40} height={40} />
        <p className="font-bold text-2xl text-mp-green-800">Mitr Phol</p>
      </NavbarBrand>

      {/* เมนูด้านขวา */}
      <NavbarContent as="div" justify="end" className="gap-6">
        {/* Language Toggle Button */}
        <div
          className="flex items-center bg-blue-50 border border-blue-200 rounded-md overflow-hidden"
          suppressHydrationWarning
        >
          <button
            onClick={() => handleLanguageChange("th")}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              currentLocale === "th"
                ? "bg-blue-600 text-white"
                : "text-blue-700 hover:bg-blue-100"
            }`}
            aria-label="Switch to Thai"
          >
            th
          </button>
          <div className="h-4 w-px bg-blue-300"></div>
          <button
            onClick={() => handleLanguageChange("en")}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              currentLocale === "en"
                ? "bg-blue-600 text-white"
                : "text-blue-700 hover:bg-blue-100"
            }`}
            aria-label="Switch to English"
          >
            en
          </button>
        </div>

        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <div className="w-10 h-10 rounded-full border-2 border-blue-500 bg-blue-100 flex items-center justify-center transition-transform hover:scale-105">
              <User className="w-6 h-6 text-blue-600" />
            </div>
          </DropdownTrigger>

          <DropdownMenu
            aria-label="Profile Actions"
            variant="flat"
            className="bg-white border border-gray-200 shadow-lg rounded-xl w-52"
          >
            <DropdownItem
              key="profile"
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors"
            >
              <span className="flex items-center gap-3 leading-none align-middle">
                <User className="text-inherit text-lg" />
                <span className="font-medium">
                  {t("profile", { defaultValue: "Profile" })}
                </span>
              </span>
            </DropdownItem>

            <DropdownItem
              key="settings"
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors"
            >
              <span className="flex items-center gap-3 leading-none align-middle">
                <Settings className="text-inherit text-lg" />
                <span className="font-medium">
                  {t("settings", { defaultValue: "Settings" })}
                </span>
              </span>
            </DropdownItem>

            <DropdownItem
              key="logout"
              color="danger"
              className="flex items-center px-4 py-2 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors border-t border-gray-200 mt-1"
              onPress={handleLogout}
              isDisabled={isLoggingOut}
            >
              <span className="flex items-center gap-3 leading-none align-middle">
                {isLoggingOut ? (
                  <Loader2 className="text-inherit text-lg animate-spin" />
                ) : (
                  <LogOut className="text-inherit text-lg" />
                )}
                <span className="font-medium">
                  {isLoggingOut
                    ? t("loggingOut", { defaultValue: "Logging out..." })
                    : t("logout", { defaultValue: "Log Out" })}
                </span>
              </span>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </NavbarContent>
    </Navbar>
  );
}
