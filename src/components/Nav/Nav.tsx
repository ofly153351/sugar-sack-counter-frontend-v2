"use client";

import { LogOut, Settings, User, Loader2, Edit } from "lucide-react";
import Logo from "../logo/logo";
import { useRouter, usePathname } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { API_CONFIG } from "@/utils/config";
import {
  useUserStore,
  initializeUserFromToken,
  getTokenFromCookies,
} from "@/store/user-store";

// Static import HeroUI components
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";

export default function Nav() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const t = useTranslations();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // Get user from Zustand store
  const { user: currentUser, clearUser } = useUserStore();

  // Compute locale directly to avoid hydration mismatch
  const getCurrentLocale = () => {
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
  };

  const currentLocale = getCurrentLocale();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load current user data - only load if not on auth pages
  useEffect(() => {
    // ไม่ต้องโหลดข้อมูลผู้ใช้ถ้าอยู่ในหน้า auth (login, register, etc.)
    const isAuthPage =
      pathname.includes("/login") ||
      pathname.includes("/register") ||
      pathname.includes("/auth");

    if (isAuthPage) {
      setIsLoadingUser(false);
      return;
    }

    const loadCurrentUser = async () => {
      try {
        setIsLoadingUser(true);

        // สำหรับ HttpOnly cookies เราไม่สามารถอ่าน token ได้จาก JavaScript
        // ดังนั้นเราจะเรียก initializeUserFromToken() โดยตรง
        // ซึ่งจะเรียก API /users/me และตรวจสอบ authentication ผ่าน cookies
        console.log("🔄 loadCurrentUser: Starting user data load...");
        await initializeUserFromToken();
      } catch (error) {
        console.error("Failed to load user data:", error);
      } finally {
        setIsLoadingUser(false);
      }
    };

    loadCurrentUser();
  }, [pathname]);

  // Check if current page is auth page
  const isAuthPage =
    pathname.includes("/login") ||
    pathname.includes("/register") ||
    pathname.includes("/auth");
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
      const response = await fetch("http://localhost:3001/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        // Clear user from Zustand store
        clearUser();
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

  const handleEditProfile = () => {
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = () => {
    // TODO: Implement save profile logic
    console.log("Saving profile:", currentUser);
    setIsEditModalOpen(false);
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (!currentUser) return t("nav.user", { defaultValue: "ผู้ใช้" });

    if (currentUser.firstName && currentUser.lastName) {
      return `${currentUser.title || ""} ${currentUser.firstName} ${
        currentUser.lastName
      }`.trim();
    }

    return currentUser.username || t("nav.user", { defaultValue: "ผู้ใช้" });
  };

  // Get user role display
  const getUserRoleDisplay = () => {
    if (!currentUser) return t("nav.user", { defaultValue: "ผู้ใช้งาน" });

    const role = currentUser.role;
    if (role === "admin")
      return t("nav.admin", { defaultValue: "ผู้ดูแลระบบ" });
    if (role === "user") return t("nav.user", { defaultValue: "ผู้ใช้งาน" });
    return role || t("nav.user", { defaultValue: "ผู้ใช้งาน" });
  };

  return (
    <>
      <Navbar className="px-3 py-4 bg-white shadow-sm border-b border-gray-200 h-18 z-30 justify-between">
        <NavbarBrand className="flex items-center gap-2">
          <Logo width={40} height={40} />
          <p className="font-bold text-2xl text-mp-green-800">Mitr Phol</p>
        </NavbarBrand>

        {/* เมนูด้านขวา */}
        <NavbarContent as="div" justify="end" className="gap-6">
          {/* Language Toggle Button */}
          <div className="flex items-center bg-blue-50 border border-blue-200 rounded-md overflow-hidden">
            <button
              onClick={() => handleLanguageChange("th")}
              className={`px-3 py-1 text-sm font-medium transition-colors ${
                currentLocale === "th"
                  ? "bg-blue-600 text-white"
                  : "text-blue-700 hover:bg-blue-100"
              }`}
            >
              TH
            </button>
            <button
              onClick={() => handleLanguageChange("en")}
              className={`px-3 py-1 text-sm font-medium transition-colors ${
                currentLocale === "en"
                  ? "bg-blue-600 text-white"
                  : "text-blue-700 hover:bg-blue-100"
              }`}
            >
              EN
            </button>
          </div>

          {/* Show user dropdown only if not on auth pages */}
          {!isAuthPage && isClient && (
            <Dropdown placement="bottom-end" showArrow id="user-dropdown">
              <DropdownTrigger>
                <button
                  id="user-dropdown-trigger"
                  className="flex items-center gap-2 focus:outline-none"
                >
                  <div className="w-10 h-10 rounded-full border-2 border-blue-500 bg-blue-100 flex items-center justify-center transition-transform hover:scale-105">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                </button>
              </DropdownTrigger>

              <DropdownMenu
                aria-label="Profile Actions"
                variant="flat"
                className="bg-white border border-gray-200 shadow-lg rounded-xl w-64"
                classNames={{
                  arrow: "bg-white border border-gray-200",
                }}
              >
                <DropdownItem
                  key="profile"
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-t-lg transition-colors cursor-default"
                  isReadOnly
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-10 h-10 rounded-full border-2 border-blue-500 bg-blue-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {getUserDisplayName()}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {getUserRoleDisplay()}
                      </p>
                      {currentUser?.employeeCode && (
                        <p className="text-xs text-gray-500 truncate">
                          {t("nav.employeeCode", {
                            defaultValue: "รหัสพนักงาน",
                          })}
                          : {currentUser.employeeCode}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={handleEditProfile}
                      className="ml-2 p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                      title={t("nav.editProfile", {
                        defaultValue: "แก้ไขโปรไฟล์",
                      })}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </DropdownItem>

                <DropdownItem
                  key="divider"
                  className="h-px bg-gray-100 my-1"
                  isReadOnly
                />

                <DropdownItem
                  key="edit-profile"
                  className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors"
                  onClick={handleEditProfile}
                >
                  <div className="flex items-center gap-2">
                    <Edit className="w-4 h-4" />
                    {t("nav.editProfile", { defaultValue: "แก้ไขโปรไฟล์" })}
                  </div>
                </DropdownItem>

                <DropdownItem
                  key="logout"
                  className="flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors"
                  onClick={handleLogout}
                >
                  <div className="flex items-center gap-2">
                    {isLoggingOut ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <LogOut className="w-4 h-4" />
                    )}
                    {isLoggingOut
                      ? t("loggingOut", { defaultValue: "กำลังออกจากระบบ..." })
                      : t("logout", { defaultValue: "ออกจากระบบ" })}
                  </div>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          )}
        </NavbarContent>
      </Navbar>

      {/* Edit Profile Modal */}
      <Modal
        id="edit-profile-modal"
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        placement="center"
        classNames={{
          base: "bg-white",
          backdrop: "bg-black/40 backdrop-blur-sm",
          wrapper: "z-[9999]",
        }}
      >
        <ModalContent className="bg-white border border-gray-300 shadow-xl rounded-2xl">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 bg-gradient-to-r from-mp-green-50 to-blue-50 border-b border-gray-200 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-mp-green-100 to-blue-100 rounded-lg">
                    <Edit className="w-5 h-5 text-mp-green-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {t("nav.editProfileTitle", {
                        defaultValue: "แก้ไขโปรไฟล์",
                      })}
                    </h3>
                    <p className="text-sm text-gray-600 font-normal mt-1">
                      {t("nav.editProfile", {
                        defaultValue: "แก้ไขข้อมูลส่วนตัวของคุณ",
                      })}
                    </p>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody className="py-6">
                {currentUser ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-mp-green-50 to-blue-50 rounded-xl border border-gray-200">
                      <div className="w-16 h-16 rounded-full border-2 border-mp-green-500 bg-gradient-to-br from-mp-green-100 to-blue-100 flex items-center justify-center shadow-sm">
                        <User className="w-8 h-8 text-mp-green-700" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-lg text-gray-900">
                          {getUserDisplayName()}
                        </p>
                        <p className="text-sm text-gray-700">
                          {getUserRoleDisplay()}
                        </p>
                        {currentUser?.employeeCode && (
                          <p className="text-xs text-gray-600 mt-1">
                            <span className="font-medium">
                              {t("nav.employeeCode", {
                                defaultValue: "รหัสพนักงาน",
                              })}
                              :
                            </span>{" "}
                            {currentUser.employeeCode}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t("nav.email", { defaultValue: "อีเมล" })}
                        </label>
                        <input
                          type="email"
                          defaultValue={currentUser?.email || ""}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t("nav.username", { defaultValue: "ชื่อผู้ใช้" })}
                        </label>
                        <input
                          type="text"
                          defaultValue={currentUser?.username || ""}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t("nav.title", { defaultValue: "คำนำหน้า" })}
                        </label>
                        <select
                          defaultValue={currentUser?.title || ""}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        >
                          <option value="">เลือกคำนำหน้า</option>
                          <option value="นาย">นาย</option>
                          <option value="นางสาว">นางสาว</option>
                          <option value="นาง">นาง</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t("nav.firstName", { defaultValue: "ชื่อ" })}
                        </label>
                        <input
                          type="text"
                          defaultValue={currentUser?.firstName || ""}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t("nav.lastName", { defaultValue: "นามสกุล" })}
                        </label>
                        <input
                          type="text"
                          defaultValue={currentUser?.lastName || ""}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t("nav.phone", {
                            defaultValue: "เบอร์โทรศัพท์",
                          })}
                        </label>
                        <input
                          type="text"
                          defaultValue={currentUser?.phone || ""}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t("nav.employeeCode", {
                            defaultValue: "รหัสพนักงาน",
                          })}
                        </label>
                        <input
                          type="text"
                          defaultValue={currentUser?.employeeCode || ""}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center py-12">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="w-12 h-12 animate-spin text-mp-green-600" />
                      <p className="text-gray-600">
                        {t("nav.loading", {
                          defaultValue: "กำลังโหลดข้อมูล...",
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter className="bg-gray-50 border-t border-gray-200 px-6 py-4">
                <div className="flex w-full gap-3">
                  <Button
                    color="default"
                    variant="light"
                    onPress={onClose}
                    className="flex-1 border border-gray-300 text-gray-800 hover:bg-gray-100 hover:border-gray-400 font-medium rounded-lg transition-colors"
                  >
                    {t("nav.cancel", { defaultValue: "ยกเลิก" })}
                  </Button>
                  <Button
                    color="primary"
                    onPress={handleSaveProfile}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium shadow-md hover:from-blue-700 hover:to-blue-800 hover:shadow-lg rounded-lg transition-all"
                  >
                    {t("nav.saveChanges", {
                      defaultValue: "บันทึกการเปลี่ยนแปลง",
                    })}
                  </Button>
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
